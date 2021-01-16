package com.flair.bi.domain;


import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToOne;
import javax.persistence.Table;

@Entity
@Table(name = "realm")
@Data
@EqualsAndHashCode(of = "id")
public class Realm {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name = "name")
    private String name;

    @OneToOne(mappedBy = "realm", cascade = CascadeType.ALL, orphanRemoval = true)
    private RealmCreationToken realmCreationToken;

}
