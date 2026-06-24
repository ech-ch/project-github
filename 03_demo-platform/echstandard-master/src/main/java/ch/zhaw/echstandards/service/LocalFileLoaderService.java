package ch.zhaw.echstandards.service;

import ch.zhaw.echstandards.model.*;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@ConditionalOnProperty(name = "github.enabled", havingValue = "false")
public class LocalFileLoaderService implements DocumentLoaderService {

    private static final Logger logger = LoggerFactory.getLogger(LocalFileLoaderService.class);
    private static final String BASE_PATH = "ech-schnittstellenstandard";
    private static final List<String> EXCLUDED_FOLDERS = Arrays.asList("archiv", "Building Blocks", ".git");

    private final Map<String, Document> documentsCache = new HashMap<>();
    private final Map<String, Document> buildingBlocksCache = new HashMap<>();

    @PostConstruct
    public void loadDocumentsOnStartup() {
        try {
            logger.info("Loading documents from local folder: {}", BASE_PATH);
            loadMainDocument();
            loadBuildingBlocks();
            logger.info("Successfully loaded documents from local folder");
        } catch (Exception e) {
            logger.error("Failed to load documents from local folder: {}", e.getMessage(), e);
        }
    }

    private void loadMainDocument() throws IOException {
        Path basePath = Paths.get(BASE_PATH);
        if (!Files.exists(basePath)) {
            logger.warn("Base path does not exist: {}", basePath);
            return;
        }

        Document document = new Document();
        document.setTitle("ECH Standards Documentation");

        List<DocumentSection> sections = new ArrayList<>();

        try (Stream<Path> paths = Files.list(basePath)) {
            List<Path> directories = paths
                    .filter(Files::isDirectory)
                    .filter(p -> !EXCLUDED_FOLDERS.contains(p.getFileName().toString()))
                    .filter(p -> {
                        String name = p.getFileName().toString();
                        return name.matches("^\\d+\\..*");
                    })
                    .sorted(Comparator.comparing(p -> extractSectionNumber(p.getFileName().toString())))
                    .collect(Collectors.toList());

            // Process each directory in parallel (1 thread per top-level folder)
            ExecutorService executor = Executors.newFixedThreadPool(directories.size());
            List<Future<DocumentSection>> futures = new ArrayList<>();

            for (Path dir : directories) {
                Path finalDir = dir;
                Future<DocumentSection> future = executor.submit(() ->
                    processDirectory(finalDir, extractSectionId(finalDir.getFileName().toString()))
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
        }

        document.setSections(sections);
        documentsCache.put("default", document);
        logger.info("Main document loaded with {} sections", sections.size());
    }

    private void loadBuildingBlocks() throws IOException {
        Path buildingBlocksPath = Paths.get(BASE_PATH, "Building Blocks");
        if (!Files.exists(buildingBlocksPath)) {
            logger.warn("Building Blocks path does not exist: {}", buildingBlocksPath);
            return;
        }

        Document document = new Document();
        document.setTitle("Building Blocks");

        List<DocumentSection> sections = new ArrayList<>();

        try (Stream<Path> paths = Files.list(buildingBlocksPath)) {
            List<Path> directories = paths
                    .filter(Files::isDirectory)
                    .filter(p -> p.getFileName().toString().startsWith("BB-"))
                    .sorted(Comparator.comparing(p -> p.getFileName().toString()))
                    .collect(Collectors.toList());

            // Process each building block in parallel (1 thread per building block)
            ExecutorService executor = Executors.newFixedThreadPool(directories.size());
            List<Future<DocumentSection>> futures = new ArrayList<>();

            for (Path dir : directories) {
                Path finalDir = dir;
                Future<DocumentSection> future = executor.submit(() ->
                    processBuildingBlockDirectory(finalDir)
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
        }

        document.setSections(sections);
        buildingBlocksCache.put("default", document);
        logger.info("Building Blocks loaded with {} blocks", sections.size());
    }

    private DocumentSection processDirectory(Path dirPath, String sectionId) {
        try {
            String dirName = dirPath.getFileName().toString();
            logger.debug("Processing directory: {} with ID: {}", dirName, sectionId);

            // Look for .md file in the directory
            Optional<Path> mdFile = Files.list(dirPath)
                    .filter(Files::isRegularFile)
                    .filter(p -> p.getFileName().toString().endsWith(".md"))
                    .findFirst();

            DocumentSection section = new DocumentSection();
            section.setId(sectionId);
            section.setTitle(dirName);
            section.setDirectory(dirName);

            if (mdFile.isPresent()) {
                String content = Files.readString(mdFile.get());
                DocumentVersion version = new DocumentVersion(
                        sectionId + "-v1",
                        "v1.0.0",
                        "2025-01-03",
                        "Initial version",
                        content
                );
                section.setVersions(Collections.singletonList(version));
            } else {
                section.setVersions(new ArrayList<>());
            }

            // Process subdirectories
            List<DocumentSection> subsections = new ArrayList<>();
            try (Stream<Path> subPaths = Files.list(dirPath)) {
                List<Path> subdirs = subPaths
                        .filter(Files::isDirectory)
                        .filter(p -> {
                            String name = p.getFileName().toString();
                            return name.matches("^\\d+\\.\\d+.*");
                        })
                        .sorted(Comparator.comparing(p -> extractSectionNumber(p.getFileName().toString())))
                        .collect(Collectors.toList());

                for (Path subdir : subdirs) {
                    DocumentSection subsection = processDirectory(subdir, extractSectionId(subdir.getFileName().toString()));
                    if (subsection != null) {
                        subsections.add(subsection);
                    }
                }
            }

            section.setSubsections(subsections);
            return section;

        } catch (IOException e) {
            logger.error("Error processing directory {}: {}", dirPath, e.getMessage());
            return null;
        }
    }

    private DocumentSection processBuildingBlockDirectory(Path dirPath) {
        try {
            String dirName = dirPath.getFileName().toString();
            logger.debug("Processing building block: {}", dirName);

            // Look for .md file in the directory
            Optional<Path> mdFile = Files.list(dirPath)
                    .filter(Files::isRegularFile)
                    .filter(p -> p.getFileName().toString().endsWith(".md"))
                    .findFirst();

            // Look for schema.json file
            Optional<Path> schemaFile = Files.list(dirPath)
                    .filter(Files::isRegularFile)
                    .filter(p -> p.getFileName().toString().endsWith(".schema.json"))
                    .findFirst();

            // Look for attribute directory
            Optional<Path> attributeDir = Files.list(dirPath)
                    .filter(Files::isDirectory)
                    .filter(p -> "attribute".equals(p.getFileName().toString()))
                    .findFirst();

            DocumentSection section = new DocumentSection();
            section.setId(dirName);
            section.setTitle(dirName.replace("BB-", "").replace("-", " "));
            section.setDirectory(dirName);

            if (mdFile.isPresent()) {
                String content = Files.readString(mdFile.get());
                String schemaContent = null;

                // Load schema JSON content if available
                if (schemaFile.isPresent()) {
                    schemaContent = Files.readString(schemaFile.get());
                }

                // Load attribute files with version history
                List<Attribute> attributes = new ArrayList<>();
                if (attributeDir.isPresent()) {
                    try (Stream<Path> attrFiles = Files.list(attributeDir.get())) {
                        attrFiles
                                .filter(Files::isRegularFile)
                                .filter(p -> p.getFileName().toString().endsWith(".schema.json"))
                                .forEach(attrFile -> {
                                    try {
                                        String attrContent = Files.readString(attrFile);
                                        // Use filename without .schema.json as key
                                        String attrName = attrFile.getFileName().toString().replace(".schema.json", "");

                                        // Create a single version for local files
                                        AttributeVersion attrVersion = new AttributeVersion(
                                            attrName + "-v1",
                                            "v1.0.0",
                                            "2025-01-03",
                                            attrContent
                                        );

                                        Attribute attribute = new Attribute(attrName, Collections.singletonList(attrVersion));
                                        attributes.add(attribute);
                                        logger.debug("Loaded attribute: {} for building block: {}", attrName, dirName);
                                    } catch (IOException e) {
                                        logger.warn("Failed to load attribute file {}: {}", attrFile, e.getMessage());
                                    }
                                });
                    }
                }

                // Extract version from content if available
                String versionLabel = extractVersionFromContent(content);

                DocumentVersion version = new DocumentVersion(
                        dirName + "-v1",
                        versionLabel,
                        "2025-01-03",
                        "Initial version",
                        content
                );
                version.setJsonContent(schemaContent);

                // Create attribute references with the single version
                List<AttributeReference> attributeRefs = new ArrayList<>();
                for (Attribute attr : attributes) {
                    if (!attr.getVersions().isEmpty()) {
                        attributeRefs.add(new AttributeReference(
                            attr.getName(),
                            attr.getVersions().get(0).getId()
                        ));
                    }
                }
                version.setAttributeReferences(attributeRefs);

                section.setVersions(Collections.singletonList(version));
                section.setAttributes(attributes);

                logger.info("Created building block '{}' with {} attributes", dirName, attributes.size());
            } else {
                section.setVersions(new ArrayList<>());
            }

            section.setSubsections(new ArrayList<>());
            return section;

        } catch (IOException e) {
            logger.error("Error processing building block {}: {}", dirPath, e.getMessage());
            return null;
        }
    }

    private String extractVersionFromContent(String content) {
        Pattern pattern = Pattern.compile("Block-Version:\\*\\*\\s*([\\d.]+)");
        Matcher matcher = pattern.matcher(content);
        if (matcher.find()) {
            return "v" + matcher.group(1);
        }
        return "v0.1.0";
    }

    private String extractSectionId(String directoryName) {
        Pattern pattern = Pattern.compile("^(\\d+(?:\\.\\d+)*)");
        Matcher matcher = pattern.matcher(directoryName);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return directoryName;
    }

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
        logger.info("Manually reloading documents from local folder");
        documentsCache.clear();
        buildingBlocksCache.clear();
        loadDocumentsOnStartup();
    }
}
