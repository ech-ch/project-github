package ch.zhaw.echstandards.controller;

import ch.zhaw.echstandards.model.Document;
import ch.zhaw.echstandards.service.DocumentLoaderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentLoaderService documentLoaderService;

    @Autowired
    public DocumentController(DocumentLoaderService documentLoaderService) {
        this.documentLoaderService = documentLoaderService;
    }

    @GetMapping
    public ResponseEntity<Document> getDocument() {
        Document document = documentLoaderService.getDocument();
        return ResponseEntity.ok(document);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Document> getDocumentById(@PathVariable String id) {
        Document document = documentLoaderService.getDocument(id);
        return ResponseEntity.ok(document);
    }

    @GetMapping("/building-blocks")
    public ResponseEntity<Document> getBuildingBlocks() {
        Document document = documentLoaderService.getBuildingBlocks();
        return ResponseEntity.ok(document);
    }

    @PostMapping("/reload")
    public ResponseEntity<String> reloadDocuments() {
        try {
            documentLoaderService.reloadDocuments();
            return ResponseEntity.ok("Documents reloaded successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Failed to reload documents: " + e.getMessage());
        }
    }
}
