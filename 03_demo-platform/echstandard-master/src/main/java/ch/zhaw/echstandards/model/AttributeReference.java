package ch.zhaw.echstandards.model;

/**
 * Represents a reference to a specific version of an attribute
 * Used in DocumentVersion to track which attribute versions are linked
 */
public class AttributeReference {
    private String attributeName;
    private String selectedVersionId;

    public AttributeReference() {
    }

    public AttributeReference(String attributeName, String selectedVersionId) {
        this.attributeName = attributeName;
        this.selectedVersionId = selectedVersionId;
    }

    public String getAttributeName() {
        return attributeName;
    }

    public void setAttributeName(String attributeName) {
        this.attributeName = attributeName;
    }

    public String getSelectedVersionId() {
        return selectedVersionId;
    }

    public void setSelectedVersionId(String selectedVersionId) {
        this.selectedVersionId = selectedVersionId;
    }
}
