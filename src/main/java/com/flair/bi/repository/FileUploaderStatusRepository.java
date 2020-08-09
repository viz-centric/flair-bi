package com.flair.bi.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.flair.bi.domain.FileUploaderStatus;

/**
 * Spring Data JPA repository for the FileUploaderStatus entity.
 */
@SuppressWarnings("unused")
public interface FileUploaderStatusRepository extends JpaRepository<FileUploaderStatus, Long> {

}
