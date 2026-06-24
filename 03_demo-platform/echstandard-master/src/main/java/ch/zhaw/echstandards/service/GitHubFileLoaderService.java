package ch.zhaw.echstandards.service;

import ch.zhaw.echstandards.model.Document;
import ch.zhaw.echstandards.model.DocumentSection;
import ch.zhaw.echstandards.model.DocumentVersion;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;

@Service
@ConditionalOnProperty(name = "github.enabled", havingValue = "true", matchIfMissing = true)
public class GitHubFileLoaderService implements DocumentLoaderService {

    private static final Logger logger = LoggerFactory.getLogger(GitHubFileLoaderService.class);

    @Value("${github.enabled:false}")
    private boolean githubEnabled;

    @Value("${github.owner:}")
    private String owner;

    @Value("${github.repo:}")
    private String repo;

    @Value("${github.base.path:}")
    private String basePath;

    @Value("${github.content.filename:content.txt}")
    private String contentFilename;

    private final GitHubApiClient gitHubApiClient;
    private final Map<String, Document> documentsCache;
    private final Map<String, Document> buildingBlocksCache;

    @Autowired
    public GitHubFileLoaderService(GitHubApiClient gitHubApiClient) {
        this.gitHubApiClient = gitHubApiClient;
        this.documentsCache = new ConcurrentHashMap<>();
        this.buildingBlocksCache = new ConcurrentHashMap<>();
    }

    @PostConstruct
    public void loadDocumentsOnStartup() {
        if (!githubEnabled) {
            logger.info("GitHub loading is disabled. Using default/fallback data.");
            loadFallbackDocument();
            loadFallbackBuildingBlocks();
            return;
        }

        if (owner == null || owner.isEmpty() || repo == null || repo.isEmpty()) {
            logger.warn("GitHub repository is not configured. Using fallback data.");
            loadFallbackDocument();
            loadFallbackBuildingBlocks();
            return;
        }

        try {
            logger.info("Loading documents from GitHub repository: {}/{}", owner, repo);
            loadDocumentFromGitHub();
            loadBuildingBlocksFromGitHub();
            logger.info("Successfully loaded documents from GitHub");
        } catch (Exception e) {
            logger.error("Failed to load documents from GitHub: {}", e.getMessage(), e);
            logger.info("Using fallback data instead");
            loadFallbackDocument();
            loadFallbackBuildingBlocks();
        }
    }

    private void loadDocumentFromGitHub() {
        try {
            Document document = new Document();
            document.setTitle("ECH Standards Documentation");

            List<DocumentSection> sections = new ArrayList<>();

            // Get contents of base path
            String scanPath = (basePath != null && !basePath.isEmpty()) ? basePath : "";
            List<GitHubApiClient.GitHubContent> contents = gitHubApiClient.listDirectoryContents(scanPath);

            // Filter for directories that match new numbering pattern (1.Einleitung, 2.Datenmodell, etc.)
            // Exclude specific folders
            List<String> excludedFolders = Arrays.asList("archiv", "Building Blocks", ".git");
            List<GitHubApiClient.GitHubContent> numberedDirs = contents.stream()
                    .filter(c -> "dir".equals(c.type))
                    .filter(c -> !excludedFolders.contains(c.name))
                    .filter(c -> c.name.matches("^\\d+\\..*"))
                    .sorted(Comparator.comparingDouble(c -> extractSectionNumber(c.name)))
                    .collect(Collectors.toList());

            logger.info("Found {} numbered directories", numberedDirs.size());
            numberedDirs.forEach(c -> {logger.info(c.name);});

            // Process each numbered directory in parallel (1 thread per top-level folder)
            ExecutorService executor = Executors.newFixedThreadPool(numberedDirs.size());
            List<Future<DocumentSection>> futures = new ArrayList<>();

            for (GitHubApiClient.GitHubContent dir : numberedDirs) {
                Future<DocumentSection> future = executor.submit(() ->
                    processDirectory(dir.path, extractSectionId(dir.name))
                );
                futures.add(future);
            }

            // Collect results maintaining order
            for (Future<DocumentSection> future : futures) {
                try {
                    DocumentSection section = future.get();
                    if (section != null) {
                        sections.add(section);
                    }
                } catch (InterruptedException | ExecutionException e) {
                    logger.error("Error processing directory: {}", e.getMessage(), e);
                }
            }

            executor.shutdown();
            try {
                if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
                    executor.shutdownNow();
                }
            } catch (InterruptedException e) {
                executor.shutdownNow();
                Thread.currentThread().interrupt();
            }

            document.setSections(sections);
            documentsCache.put("default", document);
            int totalSections = countAllSections(sections);
            logger.info("Document loaded with {} root sections ({} total including subsections)", sections.size(), totalSections);

        } catch (Exception e) {
            throw new RuntimeException("Error loading from GitHub: " + e.getMessage(), e);
        }
    }

    private void loadBuildingBlocksFromGitHub() {
        try {
            Document document = new Document();
            document.setTitle("Building Blocks");

            List<DocumentSection> sections = new ArrayList<>();

            // Get contents of Building Blocks folder
            String buildingBlocksPath = (basePath != null && !basePath.isEmpty())
                ? basePath + "/Building Blocks"
                : "Building Blocks";

            List<GitHubApiClient.GitHubContent> contents = gitHubApiClient.listDirectoryContents(buildingBlocksPath);

            // Filter for directories that start with "BB-"
            List<GitHubApiClient.GitHubContent> bbDirs = contents.stream()
                    .filter(c -> "dir".equals(c.type))
                    .filter(c -> c.name.startsWith("BB-"))
                    .sorted(Comparator.comparing(c -> c.name))
                    .collect(Collectors.toList());

            logger.info("Found {} building block directories", bbDirs.size());

            // Process each building block directory in parallel (1 thread per building block)
            ExecutorService executor = Executors.newFixedThreadPool(bbDirs.size());
            List<Future<DocumentSection>> futures = new ArrayList<>();

            for (GitHubApiClient.GitHubContent dir : bbDirs) {
                Future<DocumentSection> future = executor.submit(() ->
                    processBuildingBlockDirectory(dir.path, dir.name)
                );
                futures.add(future);
            }

            // Collect results maintaining order
            for (Future<DocumentSection> future : futures) {
                try {
                    DocumentSection section = future.get();
                    if (section != null) {
                        sections.add(section);
                    }
                } catch (InterruptedException | ExecutionException e) {
                    logger.error("Error processing building block: {}", e.getMessage(), e);
                }
            }

            executor.shutdown();
            try {
                if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
                    executor.shutdownNow();
                }
            } catch (InterruptedException e) {
                executor.shutdownNow();
                Thread.currentThread().interrupt();
            }

            document.setSections(sections);
            buildingBlocksCache.put("default", document);
            logger.info("Building Blocks loaded with {} blocks", sections.size());

        } catch (Exception e) {
            logger.error("Error loading Building Blocks from GitHub: {}", e.getMessage(), e);
            // Don't throw, just log - building blocks are optional
        }
    }

    private DocumentSection processBuildingBlockDirectory(String dirPath, String blockId) {
        logger.info("Processing building block: {} (ID: {})", dirPath, blockId);

        List<GitHubApiClient.GitHubContent> contents = gitHubApiClient.listDirectoryContents(dirPath);

        // Look for .md file in this directory
        Optional<GitHubApiClient.GitHubContent> contentFile = contents.stream()
                .filter(c -> "file".equals(c.type))
                .filter(c -> c.name.endsWith(".md"))
                .findFirst();

        // Look for schema.json file
        Optional<GitHubApiClient.GitHubContent> schemaFile = contents.stream()
                .filter(c -> "file".equals(c.type))
                .filter(c -> c.name.endsWith(".schema.json"))
                .findFirst();

        // Look for attribute directory
        Optional<GitHubApiClient.GitHubContent> attributeDir = contents.stream()
                .filter(c -> "dir".equals(c.type))
                .filter(c -> "attribute".equals(c.name))
                .findFirst();

        // Get directory name for title (remove "BB-" prefix)
        String title = blockId.replace("BB-", "").replace("-", " ");

        // Create section from content file
        DocumentSection section;
        if (contentFile.isPresent()) {
            section = createBuildingBlockSection(contentFile.get().path, blockId, title,
                    schemaFile.orElse(null), attributeDir.orElse(null));
        } else {
            section = new DocumentSection();
            section.setId(blockId);
            section.setTitle(title);
            section.setDirectory(blockId);
            section.setVersions(new ArrayList<>());
        }

        if (section != null) {
            section.setSubsections(new ArrayList<>()); // Building blocks don't have subsections
        }

        return section;
    }

    /**
     * Recursively process a directory and its subdirectories
     * Returns a DocumentSection with nested subsections
     */
    private DocumentSection processDirectory(String dirPath, String sectionId) {
        logger.info("Processing directory: {} (ID: {})", dirPath, sectionId);

        List<GitHubApiClient.GitHubContent> contents = gitHubApiClient.listDirectoryContents(dirPath);

        // Look for .md file in this directory (new structure uses .md files)
        Optional<GitHubApiClient.GitHubContent> contentFile = contents.stream()
                .filter(c -> "file".equals(c.type))
                .filter(c -> c.name.endsWith(".md"))
                .findFirst();

        // Get directory name for title
        String[] pathParts = dirPath.split("/");
        String dirName = pathParts[pathParts.length - 1];

        // Create section from content file, or create empty section
        DocumentSection section;
        if (contentFile.isPresent()) {
            section = createSectionFromFile(contentFile.get().path, sectionId, dirName);
        } else {
            section = new DocumentSection();
            section.setId(sectionId);
            section.setTitle(dirName);
            section.setDirectory(dirName);
            section.setVersions(new ArrayList<>());
        }

        if (section == null) {
            return null;
        }

        // Process subdirectories and add as nested subsections
        // Look for subdirectories with pattern like "1.1 Something", "1.2 Something"
        List<GitHubApiClient.GitHubContent> subdirs = contents.stream()
                .filter(c -> "dir".equals(c.type))
                .filter(c -> c.name.matches("^\\d+\\.\\d+.*")) // Match 1.1, 1.2, etc. with any text after
                .sorted(Comparator.comparingDouble(c -> extractSectionNumber(c.name)))
                .collect(Collectors.toList());

        List<DocumentSection> subsections = new ArrayList<>();
        for (GitHubApiClient.GitHubContent subdir : subdirs) {
            DocumentSection subsection = processDirectory(subdir.path, extractSectionId(subdir.name));
            if (subsection != null) {
                subsections.add(subsection);
            }
        }
        section.setSubsections(subsections);

        return section;
    }

    /**
     * Count all sections including nested subsections
     */
    private int countAllSections(List<DocumentSection> sections) {
        int count = 0;
        for (DocumentSection section : sections) {
            count++; // Count this section
            count += countAllSections(section.getSubsections()); // Count subsections recursively
        }
        return count;
    }

    /**
     * Create a DocumentSection from a content file by fetching its commit history
     */
    private DocumentSection createSectionFromFile(String filePath, String sectionId, String title) {
        return createSectionFromFile(filePath, sectionId, title, null);
    }

    /**
     * Create a DocumentSection for a building block with schema and attributes
     */
    private DocumentSection createBuildingBlockSection(String filePath, String sectionId, String title,
                                                       GitHubApiClient.GitHubContent schemaFileContent,
                                                       GitHubApiClient.GitHubContent attributeDirContent) {
        try {
            logger.debug("Creating building block section from file: {}", filePath);

            // Get commit history for the markdown file
            List<GitHubApiClient.GitHubCommit> commits = gitHubApiClient.getFileCommits(filePath);

            if (commits.isEmpty()) {
                logger.warn("No commits found for file: {}", filePath);
                return null;
            }

            // Reverse the list so oldest commit is first
            Collections.reverse(commits);

            // Load attribute version histories FIRST
            Map<String, ch.zhaw.echstandards.model.Attribute> attributesMap = new HashMap<>();
            if (attributeDirContent != null) {
                try {
                    List<GitHubApiClient.GitHubContent> attributeFiles = gitHubApiClient.listDirectoryContents(attributeDirContent.path);
                    for (GitHubApiClient.GitHubContent attrFile : attributeFiles) {
                        if ("file".equals(attrFile.type) && attrFile.name.endsWith(".schema.json")) {
                            String attrName = attrFile.name.replace(".schema.json", "");
                            ch.zhaw.echstandards.model.Attribute attribute = loadAttributeVersionHistory(attrFile.path, attrName);
                            if (attribute != null && !attribute.getVersions().isEmpty()) {
                                attributesMap.put(attrName, attribute);
                            }
                        }
                    }
                    logger.info("Loaded {} attributes with version history for building block '{}'", attributesMap.size(), sectionId);
                } catch (Exception e) {
                    logger.error("Error loading attribute version histories for {}: {}", sectionId, e.getMessage());
                }
            }

            List<DocumentVersion> versions = new ArrayList<>();

            // Create a version for each commit
            for (int i = 0; i < commits.size(); i++) {
                GitHubApiClient.GitHubCommit commit = commits.get(i);

                String versionId = sectionId + "-v" + (i + 1);
                String versionLabel = "v" + (i + 1);
                String date = extractDate(commit.commit.author.date);
                String notes = commit.commit.message;
                String content = gitHubApiClient.getFileContentAtCommit(filePath, commit.sha);

                // Load schema JSON content from the same commit
                String schemaContent = null;
                if (schemaFileContent != null) {
                    try {
                        schemaContent = gitHubApiClient.getFileContentAtCommit(schemaFileContent.path, commit.sha);
                    } catch (Exception e) {
                        logger.debug("No schema found for {} at commit {}: {}", schemaFileContent.path, commit.sha, e.getMessage());
                    }
                }

                DocumentVersion version = new DocumentVersion(versionId, versionLabel, date, notes, content);
                version.setJsonContent(schemaContent);

                // Create attribute references with latest version selected by default
                List<ch.zhaw.echstandards.model.AttributeReference> attributeRefs = new ArrayList<>();
                for (ch.zhaw.echstandards.model.Attribute attr : attributesMap.values()) {
                    if (!attr.getVersions().isEmpty()) {
                        // Select the latest version (last in the list)
                        ch.zhaw.echstandards.model.AttributeVersion latestVersion =
                            attr.getVersions().get(attr.getVersions().size() - 1);
                        attributeRefs.add(new ch.zhaw.echstandards.model.AttributeReference(
                            attr.getName(), latestVersion.getId()
                        ));
                    }
                }
                version.setAttributeReferences(attributeRefs);

                versions.add(version);
            }

            DocumentSection section = new DocumentSection();
            section.setId(sectionId);
            section.setTitle(title);
            section.setDirectory(title);
            section.setVersions(versions);
            section.setAttributes(new ArrayList<>(attributesMap.values()));

            logger.info("Created building block section '{}' with title '{}', {} versions, and {} attributes",
                       sectionId, title, versions.size(), attributesMap.size());

            return section;

        } catch (Exception e) {
            logger.error("Error creating building block section from file {}: {}", filePath, e.getMessage());
            return null;
        }
    }

    /**
     * Create a DocumentSection from a content file by fetching its commit history
     * Optionally includes JSON content for building blocks
     */
    private DocumentSection createSectionFromFile(String filePath, String sectionId, String title, GitHubApiClient.GitHubContent jsonFileContent) {
        try {
            logger.debug("Creating section from file: {}", filePath);

            // Get commit history for this file
            List<GitHubApiClient.GitHubCommit> commits = gitHubApiClient.getFileCommits(filePath);

            if (commits.isEmpty()) {
                logger.warn("No commits found for file: {}", filePath);
                return null;
            }

            // Reverse the list so oldest commit is first
            Collections.reverse(commits);

            List<DocumentVersion> versions = new ArrayList<>();

            // Create a version for each commit
            for (int i = 0; i < commits.size(); i++) {
                GitHubApiClient.GitHubCommit commit = commits.get(i);

                String versionId = sectionId + "-v" + (i + 1);
                String versionLabel = "v" + (i + 1);
                String date = extractDate(commit.commit.author.date);
                String notes = commit.commit.message;
                String content = gitHubApiClient.getFileContentAtCommit(filePath, commit.sha);

                // Load JSON content from the same commit (for building blocks)
                String jsonContent = null;
                if (jsonFileContent != null) {
                    try {
                        jsonContent = gitHubApiClient.getFileContentAtCommit(jsonFileContent.path, commit.sha);
                    } catch (Exception e) {
                        logger.debug("No JSON content found for {} at commit {}: {}", jsonFileContent.path, commit.sha, e.getMessage());
                    }
                }

                // Content is already in markdown/HTML format, no need to wrap
                DocumentVersion version = new DocumentVersion(versionId, versionLabel, date, notes, content);
                version.setJsonContent(jsonContent);
                versions.add(version);
            }

            DocumentSection section = new DocumentSection();
            section.setId(sectionId);
            section.setTitle(title);
            section.setDirectory(title);
            section.setVersions(versions);

            logger.info("Created section '{}' with title '{}' and {} versions", sectionId, title, versions.size());

            return section;

        } catch (Exception e) {
            logger.error("Error creating section from file {}: {}", filePath, e.getMessage());
            return null;
        }
    }

    /**
     * Load the version history for a specific attribute file
     */
    private ch.zhaw.echstandards.model.Attribute loadAttributeVersionHistory(String attributeFilePath, String attributeName) {
        try {
            logger.debug("Loading version history for attribute: {}", attributeFilePath);

            // Get commit history for this attribute file
            List<GitHubApiClient.GitHubCommit> commits = gitHubApiClient.getFileCommits(attributeFilePath);

            if (commits.isEmpty()) {
                logger.warn("No commits found for attribute file: {}", attributeFilePath);
                return null;
            }

            // Reverse the list so oldest commit is first
            Collections.reverse(commits);

            List<ch.zhaw.echstandards.model.AttributeVersion> versions = new ArrayList<>();

            // Create a version for each commit
            for (int i = 0; i < commits.size(); i++) {
                GitHubApiClient.GitHubCommit commit = commits.get(i);

                String versionId = attributeName + "-v" + (i + 1);
                String versionLabel = "v" + (i + 1);
                String date = extractDate(commit.commit.author.date);
                String content = gitHubApiClient.getFileContentAtCommit(attributeFilePath, commit.sha);

                ch.zhaw.echstandards.model.AttributeVersion version =
                    new ch.zhaw.echstandards.model.AttributeVersion(versionId, versionLabel, date, content);
                versions.add(version);
            }

            ch.zhaw.echstandards.model.Attribute attribute =
                new ch.zhaw.echstandards.model.Attribute(attributeName, versions);

            logger.debug("Loaded {} versions for attribute '{}'", versions.size(), attributeName);
            return attribute;

        } catch (Exception e) {
            logger.error("Error loading version history for attribute {}: {}", attributeFilePath, e.getMessage());
            return null;
        }
    }

    /**
     * Extract date in YYYY-MM-DD format from ISO 8601 datetime
     */
    private String extractDate(String isoDateTime) {
        try {
            ZonedDateTime dateTime = ZonedDateTime.parse(isoDateTime);
            return dateTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        } catch (Exception e) {
            logger.warn("Failed to parse date: {}", isoDateTime);
            return isoDateTime.substring(0, 10); // fallback to simple substring
        }
    }

    /**
     * Format section ID into a readable title
     * Example: "1" -> "1. Section", "1.1" -> "1.1 Subsection"
     */
    private String formatSectionTitle(String sectionId) {
        // You can customize this based on your needs
        long dotCount = sectionId.chars().filter(ch -> ch == '.').count();

        if (dotCount == 0) {
            return sectionId + ". Section";
        } else if (dotCount == 1) {
            return sectionId + " Subsection";
        } else {
            return sectionId + " Item";
        }
    }

    /**
     * Parse version number for sorting (e.g., "1.1.2" -> [1, 1, 2])
     */
    private List<Integer> parseVersionNumber(String version) {
        return Arrays.stream(version.split("\\."))
                .map(Integer::parseInt)
                .collect(Collectors.toList());
    }

    /**
     * Compare two version number lists element by element
     * Returns negative if v1 < v2, positive if v1 > v2, zero if equal
     */
    private int compareVersionNumbers(List<Integer> v1, List<Integer> v2) {
        int minLength = Math.min(v1.size(), v2.size());

        for (int i = 0; i < minLength; i++) {
            int comparison = v1.get(i).compareTo(v2.get(i));
            if (comparison != 0) {
                return comparison;
            }
        }

        // If all compared elements are equal, the shorter list comes first
        return Integer.compare(v1.size(), v2.size());
    }

    /**
     * Extract section ID from directory name
     * Examples:
     *   "1.Einleitung" -> "1"
     *   "1.1 Status" -> "1.1"
     *   "2.Datenmodell" -> "2"
     */
    private String extractSectionId(String directoryName) {
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("^(\\d+(?:\\.\\d+)*)");
        java.util.regex.Matcher matcher = pattern.matcher(directoryName);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return directoryName;
    }

    /**
     * Extract section number for sorting
     * Examples:
     *   "1.Einleitung" -> 1.0
     *   "1.1 Status" -> 1.1
     *   "2.Datenmodell" -> 2.0
     */
    private double extractSectionNumber(String directoryName) {
        String sectionId = extractSectionId(directoryName);
        String[] parts = sectionId.split("\\.");
        if (parts.length > 0) {
            try {
                double mainNumber = Double.parseDouble(parts[0]);
                if (parts.length > 1) {
                    mainNumber += Double.parseDouble(parts[1]) / 100.0;
                }
                if (parts.length > 2) {
                    mainNumber += Double.parseDouble(parts[2]) / 10000.0;
                }
                return mainNumber;
            } catch (NumberFormatException e) {
                return 0;
            }
        }
        return 0;
    }

    private void loadFallbackDocument() {
        Document fallbackDoc = new Document();
        fallbackDoc.setTitle("ECH Standards Documentation (Fallback)");
        fallbackDoc.setSections(new ArrayList<>());
        documentsCache.put("default", fallbackDoc);
        logger.info("Fallback document loaded");
    }

    private void loadFallbackBuildingBlocks() {
        Document fallbackDoc = new Document();
        fallbackDoc.setTitle("Building Blocks (Fallback)");
        fallbackDoc.setSections(new ArrayList<>());
        buildingBlocksCache.put("default", fallbackDoc);
        logger.info("Fallback building blocks loaded");
    }

    @Override
    public Document getDocument() {
        return documentsCache.getOrDefault("default", new Document());
    }

    @Override
    public Document getDocument(String id) {
        return documentsCache.getOrDefault(id, new Document());
    }

    @Override
    public Document getBuildingBlocks() {
        return buildingBlocksCache.getOrDefault("default", new Document());
    }

    @Override
    public void reloadDocuments() {
        logger.info("Manually reloading documents from GitHub");
        documentsCache.clear();
        buildingBlocksCache.clear();
        loadDocumentsOnStartup();
    }

    // Keep old method name for backward compatibility
    public void reloadFromGitHub() {
        reloadDocuments();
    }
}
