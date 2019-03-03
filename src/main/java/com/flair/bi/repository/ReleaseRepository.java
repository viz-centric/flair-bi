package com.flair.bi.repository;

import com.flair.bi.domain.Release;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

public interface ReleaseRepository extends JpaRepository<Release, Long> {
}
