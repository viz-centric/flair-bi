package com.flair.bi.domain.listeners;

import com.flair.bi.domain.propertytype.PropertyType;
import com.flair.bi.domain.propertytype.SelectPropertyType;

import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;

/**
 * Entity listener for {@link PropertyType}
 */
public class PropertyTypeListener {


    public static PropertyType rewireRelationships(PropertyType entity) {
        if (entity instanceof SelectPropertyType) {
            SelectPropertyType selectPropertyType = (SelectPropertyType) entity;

            selectPropertyType.getPossibleValues()
                .stream()
                .filter(y -> y.getSelectPropertyType() == null)
                .forEach(x -> x.setSelectPropertyType(selectPropertyType));

            selectPropertyType.getPossibleValues()
                .stream()
                .filter(x -> x.equalValue(selectPropertyType.getDefaultValue()))
                .findFirst()
                .ifPresent(selectPropertyType::addDefaultValue);
        }
        return entity;
    }


    @PrePersist
    public void prePersist(PropertyType entity) {
        rewireRelationships(entity);

    }

    @PreUpdate
    public void preUpdate(PropertyType entity) {
        rewireRelationships(entity);
    }
}
