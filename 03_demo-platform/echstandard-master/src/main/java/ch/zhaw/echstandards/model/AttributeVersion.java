package ch.zhaw.echstandards.model;

public class AttributeVersion {
    private String id;
    private String version;
    private String date;
    private String content; // JSON content of the attribute schema

    public AttributeVersion() {
    }

    public AttributeVersion(String id, String version, String date, String content) {
        this.id = id;
        this.version = version;
        this.date = date;
        this.content = content;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
