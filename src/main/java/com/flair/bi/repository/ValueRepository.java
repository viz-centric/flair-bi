package com.flair.bi.repository;

import com.flair.bi.domain.value.Value;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ValueRepository extends JpaRepository<Value, Long> {
}
