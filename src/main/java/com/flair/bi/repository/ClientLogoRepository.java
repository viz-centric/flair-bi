package com.flair.bi.repository;

import com.flair.bi.domain.ClientLogo;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.*;


/**
 * Spring Data JPA repository for the ClientLogo entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ClientLogoRepository extends JpaRepository<ClientLogo,Long> {

    @Modifying
    @Query("update ClientLogo c set c.url = :url where c.id = :id")
    void updateImageLocation(@Param("url") String url, @Param("id") Long id);

    @Query("update ClientLogo c set c.url = :url where c.id = :id")
    void getImageLocation(@Param("url") String url, @Param("id") Long id);
}
