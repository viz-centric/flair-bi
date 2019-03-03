package com.flair.bi.domain.enumeration;

import org.apache.commons.lang3.builder.ToStringBuilder;

public enum Action {

    /**
     * Can read something
     */
    READ("READ"),
    /**
     * Can write something
     */
    WRITE("WRITE"),
    /**
     * Can update something
     */
    UPDATE("UPDATE"),
    /**
     * Can delete something
     */
    DELETE("DELETE"),

    /**
     * Meaning that user can toggle whether entity is published or not
     */
    TOGGLE_PUBLISH("TOGGLE-PUBLISH"),

    /**
     * Meaning that use is able to read published entity
     */
    READ_PUBLISHED("READ-PUBLISHED"),

    /**
     * Able to delete published entity
     */
    DELETE_PUBLISHED("DELETE-PUBLISHED"),

    /**
     * Can create a request for publish
     */
    REQUEST_PUBLISH("REQUEST-PUBLISH"),

    /**
     * Can approve of disapprove publish
     */
    MANAGE_PUBLISH("MANAGE-PUBLISH"),

    /**
     * Able to rollback previous release
     */
    ROLLBACK_PUBLISH("ROLLBACK-PUBLISH"),

    UNPUBLISHED("UNPUBLISHED");

    private final String type;

    Action(final String type) {
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

    public static Action fromStringValue(String value) {
        for (Action b : Action.values()) {
            if (b.getType().equalsIgnoreCase(value)) {
                return b;
            }
        }
        return null;
    }


}
