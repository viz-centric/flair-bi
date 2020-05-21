package com.flair.bi.domain;

import javax.persistence.MappedSuperclass;

import org.hibernate.annotations.TypeDef;
import org.hibernate.annotations.TypeDefs;

import com.flair.bi.config.types.JsonBinaryType;
import com.flair.bi.config.types.JsonStringType;

@TypeDefs({ @TypeDef(name = "json", typeClass = JsonStringType.class),
		@TypeDef(name = "jsonb", typeClass = JsonBinaryType.class) })
@MappedSuperclass
public abstract class BaseEntity {
}
