package com.flair.bi.domain.enumeration;

import org.apache.commons.lang3.builder.ToStringBuilder;

public enum GaugeType {

    DEFAULT("DEFAULT"),
    RADIAL("RADIAL");

    private final String type;

    private GaugeType(final String type) {

        this.type = type;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this)
            .append("type", type)
            .toString();
    }

    public String getType() {
        return type;
    }
}
