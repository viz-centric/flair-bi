package com.flair.bi.domain;

import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.Instant;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "email_confirmation_token")
@Data
public class EmailConfirmationToken extends BaseEntity implements Serializable {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;

	@NotNull
	@Column(nullable = false)
	private String token;

	@NotNull
	@Column(name = "date_created")
	private Instant dateCreated;

	@ManyToOne
	@NotNull
	private DraftUser draftUser;

	@NotNull
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private EmailConfirmationTokenStatus status;

}
