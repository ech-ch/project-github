package ch.zhaw.echstandards.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GitHubDiscussionsService {

    private static final Logger logger = LoggerFactory.getLogger(GitHubDiscussionsService.class);
    private static final String GITHUB_GRAPHQL_API = "https://api.github.com/graphql";

    @Value("${github.owner:}")
    private String owner;

    @Value("${github.repo:}")
    private String repo;

    @Value("${github.token:}")
    private String token;

    private final WebClient webClient;

    public GitHubDiscussionsService() {
        this.webClient = WebClient.builder()
                .baseUrl(GITHUB_GRAPHQL_API)
                .build();
    }

    /**
     * Fetch all discussions from the repository
     */
    public DiscussionsResponse getDiscussions(int first) {
        String query = """
            query($owner: String!, $repo: String!, $first: Int!) {
              repository(owner: $owner, name: $repo) {
                discussions(first: $first, orderBy: {field: CREATED_AT, direction: DESC}) {
                  totalCount
                  nodes {
                    id
                    title
                    body
                    createdAt
                    updatedAt
                    number
                    url
                    author {
                      login
                      avatarUrl
                    }
                    category {
                      name
                    }
                    comments(first: 10) {
                      totalCount
                      nodes {
                        id
                        body
                        createdAt
                        author {
                          login
                          avatarUrl
                        }
                      }
                    }
                  }
                }
              }
            }
            """;

        Map<String, Object> variables = new HashMap<>();
        variables.put("owner", owner);
        variables.put("repo", repo);
        variables.put("first", first);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("query", query);
        requestBody.put("variables", variables);

        logger.debug("Fetching discussions for {}/{}", owner, repo);

        return executeGraphQLQuery(requestBody, DiscussionsResponse.class)
                .onErrorResume(e -> {
                    logger.error("Error fetching discussions: {}", e.getMessage());
                    return Mono.just(new DiscussionsResponse());
                })
                .block();
    }

    /**
     * Create a new discussion
     */
    public CreateDiscussionResponse createDiscussion(String categoryId, String title, String body) {
        return createDiscussion(categoryId, title, body, null);
    }

    /**
     * Create a new discussion with optional building block label
     */
    public CreateDiscussionResponse createDiscussion(String categoryId, String title, String body, String buildingBlockLabel) {
        try {
            // First, we need to get the repository ID
            String repoIdQuery = """
                query($owner: String!, $repo: String!) {
                  repository(owner: $owner, name: $repo) {
                    id
                  }
                }
                """;

            Map<String, Object> repoVariables = new HashMap<>();
            repoVariables.put("owner", owner);
            repoVariables.put("repo", repo);

            Map<String, Object> repoRequestBody = new HashMap<>();
            repoRequestBody.put("query", repoIdQuery);
            repoRequestBody.put("variables", repoVariables);

            logger.info("Fetching repository ID for {}/{}", owner, repo);

            RepositoryIdResponse repoIdResponse = executeGraphQLQuery(repoRequestBody, RepositoryIdResponse.class)
                    .doOnError(e -> logger.error("Error fetching repository ID: {}", e.getMessage(), e))
                    .block();

            if (repoIdResponse == null || repoIdResponse.data == null || repoIdResponse.data.repository == null) {
                logger.error("Failed to get repository ID. Response: {}", repoIdResponse);
                throw new RuntimeException("Failed to get repository ID");
            }

            String repositoryId = repoIdResponse.data.repository.id;
            logger.info("Repository ID: {}", repositoryId);

            // Now create the discussion
            String createMutation = """
                mutation($repositoryId: ID!, $categoryId: ID!, $title: String!, $body: String!) {
                  createDiscussion(input: {
                    repositoryId: $repositoryId,
                    categoryId: $categoryId,
                    title: $title,
                    body: $body
                  }) {
                    discussion {
                      id
                      title
                      body
                      url
                    }
                  }
                }
                """;

            // Add building block label to body if provided
            String finalBody = body;
            if (buildingBlockLabel != null && !buildingBlockLabel.isEmpty()) {
                finalBody = body + "\n\n---\n**Building Block:** `" + buildingBlockLabel + "`";
            }

            Map<String, Object> createVariables = new HashMap<>();
            createVariables.put("repositoryId", repositoryId);
            createVariables.put("categoryId", categoryId);
            createVariables.put("title", title);
            createVariables.put("body", finalBody);

            Map<String, Object> createRequestBody = new HashMap<>();
            createRequestBody.put("query", createMutation);
            createRequestBody.put("variables", createVariables);

            logger.info("Creating discussion: {} with category ID: {}", title, categoryId);

            CreateDiscussionResponse response = executeGraphQLQuery(createRequestBody, CreateDiscussionResponse.class)
                    .doOnError(e -> logger.error("Error creating discussion: {}", e.getMessage(), e))
                    .block();

            // Check for GraphQL errors
            if (response != null && response.errors != null && !response.errors.isEmpty()) {
                logger.error("=== GraphQL Errors ===");
                for (GraphQLError error : response.errors) {
                    logger.error("Error: {}", error.message);
                    logger.error("Type: {}", error.type);
                }
                logger.error("=====================");
                throw new RuntimeException("GraphQL Error: " + response.errors.get(0).message);
            }

            if (response != null && response.data != null && response.data.createDiscussion != null) {
                logger.info("Discussion created successfully: {}", response.data.createDiscussion.discussion.url);
            } else {
                logger.error("Discussion creation returned null or incomplete response");
                logger.error("Response: {}", response);
                logger.error("Response.data: {}", response != null ? response.data : "null");
                if (response != null && response.data != null) {
                    logger.error("Response.data.createDiscussion: {}", response.data.createDiscussion);
                }
            }

            return response;
        } catch (Exception e) {
            logger.error("Exception in createDiscussion: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Add a comment to a discussion
     */
    public AddCommentResponse addComment(String discussionId, String body) {
        try {
            String mutation = """
                mutation($discussionId: ID!, $body: String!) {
                  addDiscussionComment(input: {
                    discussionId: $discussionId,
                    body: $body
                  }) {
                    comment {
                      id
                      body
                      createdAt
                      author {
                        login
                      }
                    }
                  }
                }
                """;

            Map<String, Object> variables = new HashMap<>();
            variables.put("discussionId", discussionId);
            variables.put("body", body);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("query", mutation);
            requestBody.put("variables", variables);

            logger.info("Adding comment to discussion: {}", discussionId);

            AddCommentResponse response = executeGraphQLQuery(requestBody, AddCommentResponse.class)
                    .doOnError(e -> logger.error("Error adding comment: {}", e.getMessage(), e))
                    .block();

            // Check for GraphQL errors
            if (response != null && response.errors != null && !response.errors.isEmpty()) {
                logger.error("=== GraphQL Errors (Add Comment) ===");
                for (GraphQLError error : response.errors) {
                    logger.error("Error: {}", error.message);
                    logger.error("Type: {}", error.type);
                }
                logger.error("===================================");
                throw new RuntimeException("GraphQL Error: " + response.errors.get(0).message);
            }

            if (response != null && response.data != null && response.data.addDiscussionComment != null) {
                logger.info("Comment added successfully");
            } else {
                logger.error("Comment creation returned null or incomplete response: {}", response);
            }

            return response;
        } catch (Exception e) {
            logger.error("Exception in addComment: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Get discussion categories
     */
    public CategoriesResponse getCategories() {
        String query = """
            query($owner: String!, $repo: String!) {
              repository(owner: $owner, name: $repo) {
                discussionCategories(first: 10) {
                  nodes {
                    id
                    name
                    description
                  }
                }
              }
            }
            """;

        Map<String, Object> variables = new HashMap<>();
        variables.put("owner", owner);
        variables.put("repo", repo);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("query", query);
        requestBody.put("variables", variables);

        logger.debug("Fetching discussion categories for {}/{}", owner, repo);

        return executeGraphQLQuery(requestBody, CategoriesResponse.class)
                .onErrorResume(e -> {
                    logger.error("Error fetching categories: {}", e.getMessage());
                    return Mono.just(new CategoriesResponse());
                })
                .block();
    }

    /**
     * Execute a GraphQL query
     */
    private <T> Mono<T> executeGraphQLQuery(Map<String, Object> requestBody, Class<T> responseType) {
        WebClient.RequestHeadersSpec<?> request = webClient.post()
                .bodyValue(requestBody);

        if (token != null && !token.isEmpty()) {
            request = request.header("Authorization", "Bearer " + token);
        }

        return request.retrieve()
                .bodyToMono(responseType);
    }

    // DTOs for GraphQL responses

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DiscussionsResponse {
        public Data data;

        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Data {
            public Repository repository;
        }

        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Repository {
            public Discussions discussions;
        }

        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Discussions {
            public int totalCount;
            public List<Discussion> nodes;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Discussion {
        public String id;
        public String title;
        public String body;
        public String createdAt;
        public String updatedAt;
        public int number;
        public String url;
        public Author author;
        public Category category;
        public Comments comments;

        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Author {
            public String login;
            public String avatarUrl;
        }

        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Category {
            public String name;
        }

        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Comments {
            public int totalCount;
            public List<Comment> nodes;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Comment {
        public String id;
        public String body;
        public String createdAt;
        public Author author;

        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Author {
            public String login;
            public String avatarUrl;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CreateDiscussionResponse {
        public CreateData data;
        public List<GraphQLError> errors;

        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class CreateData {
            public CreateDiscussionPayload createDiscussion;
        }

        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class CreateDiscussionPayload {
            public Discussion discussion;
        }

        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Discussion {
            public String id;
            public String title;
            public String body;
            public String url;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class GraphQLError {
        public String message;
        public String type;
        public List<Location> locations;

        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Location {
            public int line;
            public int column;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AddCommentResponse {
        public AddCommentData data;
        public List<GraphQLError> errors;

        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class AddCommentData {
            public AddCommentPayload addDiscussionComment;
        }

        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class AddCommentPayload {
            public Comment comment;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CategoriesResponse {
        public CategoriesData data;

        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class CategoriesData {
            public Repository repository;
        }

        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Repository {
            public DiscussionCategories discussionCategories;
        }

        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class DiscussionCategories {
            public List<DiscussionCategory> nodes;
        }

        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class DiscussionCategory {
            public String id;
            public String name;
            public String description;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class RepositoryIdResponse {
        public RepositoryData data;

        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class RepositoryData {
            public Repository repository;
        }

        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Repository {
            public String id;
        }
    }
}
