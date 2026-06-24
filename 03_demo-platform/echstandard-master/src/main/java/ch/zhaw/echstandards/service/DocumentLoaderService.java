package ch.zhaw.echstandards.service;

import ch.zhaw.echstandards.model.Document;

public interface DocumentLoaderService {
    Document getDocument();
    Document getDocument(String id);
    Document getBuildingBlocks();
    void reloadDocuments();
}
