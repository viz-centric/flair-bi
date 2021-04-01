package com.flair.bi.domain;


import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToOne;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;
import java.time.Instant;

@Entity
@Table(name = "realm_creation_token")
@Data
@ToString(exclude = "realm")
@EqualsAndHashCode(of = "id")
public class RealmCreationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "realm_creation_token_id_seq")
    @SequenceGenerator(name = "realm_creation_token_id_seq", allocationSize = 1)
    private Long id;

    @NotNull
    @Column(nullable = false)
    private String token;

    @NotNull
    @Column(nullable = false)
    private Instant dateCreated;

    @OneToOne
    @JsonIgnore
    private Realm realm;

}
