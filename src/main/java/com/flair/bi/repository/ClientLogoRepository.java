package com.flair.bi.repository;

import com.flair.bi.domain.ClientLogo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


/**
 * Spring Data JPA repository for the ClientLogo entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ClientLogoRepository extends JpaRepository<ClientLogo,Long>,
        QuerydslPredicateExecutor<ClientLogo> {

    @Modifying
    @Query("update ClientLogo c set c.url = :url where c.id = :id and c.realm.id = :realmId")
    void updateImageLocation(@Param("url") String url, @Param("id") Long id, @Param("realmId") Long realmId);

}
