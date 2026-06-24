package ch.zhaw.echstandards.model;

import java.util.ArrayList;
import java.util.List;

public class Attribute {
    private String name;
    private List<AttributeVersion> versions;

    public Attribute() {
        this.versions = new ArrayList<>();
    }

    public Attribute(String name, List<AttributeVersion> versions) {
        this.name = name;
        this.versions = versions != null ? versions : new ArrayList<>();
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<AttributeVersion> getVersions() {
        return versions;
    }

    public void setVersions(List<AttributeVersion> versions) {
        this.versions = versions;
    }
}
