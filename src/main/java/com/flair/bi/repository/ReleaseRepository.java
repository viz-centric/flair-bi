package com.flair.bi.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.flair.bi.domain.Release;

public interface ReleaseRepository extends JpaRepository<Release, Long> {
}
