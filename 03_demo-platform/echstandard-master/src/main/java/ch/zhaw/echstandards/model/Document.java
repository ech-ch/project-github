package ch.zhaw.echstandards.model;

import java.util.ArrayList;
import java.util.List;

public class Document {
    private String title;
    private List<DocumentSection> sections;

    public Document() {
        this.sections = new ArrayList<>();
    }

    public Document(String title, List<DocumentSection> sections) {
        this.title = title;
        this.sections = sections != null ? sections : new ArrayList<>();
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public List<DocumentSection> getSections() {
        return sections;
    }

    public void setSections(List<DocumentSection> sections) {
        this.sections = sections;
    }
}
