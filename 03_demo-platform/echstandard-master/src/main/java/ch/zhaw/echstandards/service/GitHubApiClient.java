package ch.zhaw.echstandards.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Base64;
import java.util.List;

@Service
public class GitHubApiClient {

    private static final Logger logger = LoggerFactory.getLogger(GitHubApiClient.class);
    private static final String GITHUB_API_BASE = "https://api.github.com";

    @Value("${github.owner:}")
    private String owner;

    @Value("${github.repo:}")
    private String repo;

    @Value("${github.branch:main}")
    private String branch;

    @Value("${github.token:}")
    private String token;

    private final WebClient webClient;

    public GitHubApiClient() {
        this.webClient = WebClient.builder()
                .baseUrl(GITHUB_API_BASE)
                .build();
    }

    /**
     * List contents of a directory in the repository
     */
    public List<GitHubContent> listDirectoryContents(String path) {
        String url = String.format("/repos/%s/%s/contents/%s", owner, repo, path);
        logger.debug("Fetching directory contents: {}", url);

        WebClient.RequestHeadersSpec<?> request = webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(url)
                        .queryParam("ref", branch)
                        .build());

        if (token != null && !token.isEmpty()) {
            request = request.header("Authorization", "Bearer " + token);
        }

        return request
                .retrieve()
                .bodyToFlux(GitHubContent.class)
                .collectList()
                .onErrorResume(e -> {
                    logger.error("Error fetching directory contents for {}: {}", path, e.getMessage());
                    return Mono.just(List.of());
                })
                .block();
    }

    /**
     * Get commit history for a specific file
     */
    public List<GitHubCommit> getFileCommits(String path) {
        String url = String.format("/repos/%s/%s/commits", owner, repo);
        logger.debug("Fetching commit history for: {}", path);

        WebClient.RequestHeadersSpec<?> request = webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(url)
                        .queryParam("path", path)
                        .queryParam("sha", branch)
                        .build());

        if (token != null && !token.isEmpty()) {
            request = request.header("Authorization", "Bearer " + token);
        }

        return request
                .retrieve()
                .bodyToFlux(GitHubCommit.class)
                .collectList()
                .onErrorResume(e -> {
                    logger.error("Error fetching commits for {}: {}", path, e.getMessage());
                    return Mono.just(List.of());
                })
                .block();
    }

    /**
     * Get file content at a specific commit
     */
    public String getFileContentAtCommit(String path, String commitSha) {
        String url = String.format("/repos/%s/%s/contents/%s", owner, repo, path);
        logger.debug("Fetching file content at commit {}: {}", commitSha, path);

        WebClient.RequestHeadersSpec<?> request = webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(url)
                        .queryParam("ref", commitSha)
                        .build());

        if (token != null && !token.isEmpty()) {
            request = request.header("Authorization", "Bearer " + token);
        }

        GitHubContent content = request
                .retrieve()
                .bodyToMono(GitHubContent.class)
                .onErrorResume(e -> {
                    logger.error("Error fetching file content for {} at {}: {}", path, commitSha, e.getMessage());
                    return Mono.empty();
                })
                .block();

        if (content != null && content.content != null) {
            // GitHub API returns base64 encoded content
            return new String(Base64.getDecoder().decode(content.content.replace("\n", "")));
        }

        return "";
    }

    // DTOs for GitHub API responses

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class GitHubContent {
        public String name;
        public String path;
        public String sha;
        public Long size;
        public String url;

        @JsonProperty("html_url")
        public String htmlUrl;

        @JsonProperty("git_url")
        public String gitUrl;

        @JsonProperty("download_url")
        public String downloadUrl;

        public String type; // "file" or "dir"
        public String content; // base64 encoded
        public String encoding; // typically "base64"

        @JsonProperty("_links")
        public Links links;

        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Links {
            public String self;
            public String git;
            public String html;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class GitHubCommit {
        public String sha;
        public CommitDetails commit;

        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class CommitDetails {
            public String message;
            public AuthorInfo author;

            @JsonIgnoreProperties(ignoreUnknown = true)
            public static class AuthorInfo {
                public String name;
                public String date; // ISO 8601 format
            }
        }
    }
}
