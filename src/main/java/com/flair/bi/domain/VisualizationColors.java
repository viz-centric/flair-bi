package com.flair.bi.domain;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.Objects;

/**
 * A VisualizationColors.
 */
@Entity
@Table(name = "visualization_colors")
public class VisualizationColors implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;

	@NotNull
	@Column(name = "code", nullable = false)
	private String code;

	@ManyToOne(optional = false)
    private Realm realm;

    public Long getId() {
        return id;
    }

	public void setId(Long id) {
		this.id = id;
	}

	public String getCode() {
		return code;
	}

	public VisualizationColors code(String code) {
		this.code = code;
		return this;
	}

	public void setCode(String code) {
		this.code = code;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) {
			return true;
		}
		if (o == null || getClass() != o.getClass()) {
			return false;
		}
		VisualizationColors visualizationColors = (VisualizationColors) o;
		if (visualizationColors.id == null || id == null) {
			return false;
		}
		return Objects.equals(id, visualizationColors.id);
	}

	@Override
	public int hashCode() {
		return Objects.hashCode(id);
	}

    @Override
    public String toString() {
        return "VisualizationColors{" +
            "id=" + id +
            ", code='" + code + "'" +
            '}';
    }

    public Realm getRealm() {
        return realm;
    }

    public void setRealm(Realm realm) {
        this.realm = realm;
    }
}
