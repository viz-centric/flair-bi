package com.flair.bi.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.flair.bi.domain.PersistentToken;
import com.flair.bi.domain.User;

/**
 * Spring Data JPA repository for the PersistentToken entity.
 */
public interface PersistentTokenRepository extends JpaRepository<PersistentToken, String> {

	List<PersistentToken> findByUser(User user);

	List<PersistentToken> findByTokenDateBefore(LocalDate localDate);

}
