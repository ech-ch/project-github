package ch.zhaw.echstandards.model;

import java.util.ArrayList;
import java.util.List;

public class DocumentSection {
    private String id;
    private String title;
    private String directory;
    private List<DocumentVersion> versions;
    private List<DocumentSection> subsections;
    private List<Attribute> attributes; // For building blocks: attributes with version history

    public DocumentSection() {
        this.versions = new ArrayList<>();
        this.subsections = new ArrayList<>();
        this.attributes = new ArrayList<>();
    }

    public DocumentSection(String id, String title, List<DocumentVersion> versions) {
        this.id = id;
        this.title = title;
        this.versions = versions != null ? versions : new ArrayList<>();
        this.subsections = new ArrayList<>();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public List<DocumentVersion> getVersions() {
        return versions;
    }

    public void setVersions(List<DocumentVersion> versions) {
        this.versions = versions;
    }

    public List<DocumentSection> getSubsections() {
        return subsections;
    }

    public void setSubsections(List<DocumentSection> subsections) {
        this.subsections = subsections;
    }

    public String getDirectory() {
        return directory;
    }

    public void setDirectory(String directory) {
        this.directory = directory;
    }

    public List<Attribute> getAttributes() {
        return attributes;
    }

    public void setAttributes(List<Attribute> attributes) {
        this.attributes = attributes;
    }
}
