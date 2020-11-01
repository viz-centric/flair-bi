package com.flair.bi.repository;

import com.flair.bi.domain.FileUploaderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

/**
 * Spring Data JPA repository for the FileUploaderStatus entity.
 */
@SuppressWarnings("unused")
public interface FileUploaderStatusRepository extends JpaRepository<FileUploaderStatus, Long>, QuerydslPredicateExecutor<FileUploaderStatus> {

}
