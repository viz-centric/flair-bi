package com.flair.bi.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.flair.bi.domain.value.Value;

public interface ValueRepository extends JpaRepository<Value, Long> {
}
