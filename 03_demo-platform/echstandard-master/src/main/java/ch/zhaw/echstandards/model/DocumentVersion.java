package ch.zhaw.echstandards.model;

import java.util.List;

public class DocumentVersion {
    private String id;
    private String label;
    private String date;
    private String notes;
    private String content;
    private String jsonContent;
    private List<AttributeReference> attributeReferences; // References to selected attribute versions for this building block version

    public DocumentVersion() {
    }

    public DocumentVersion(String id, String label, String date, String notes, String content) {
        this.id = id;
        this.label = label;
        this.date = date;
        this.notes = notes;
        this.content = content;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getJsonContent() {
        return jsonContent;
    }

    public void setJsonContent(String jsonContent) {
        this.jsonContent = jsonContent;
    }

    public List<AttributeReference> getAttributeReferences() {
        return attributeReferences;
    }

    public void setAttributeReferences(List<AttributeReference> attributeReferences) {
        this.attributeReferences = attributeReferences;
    }
}
