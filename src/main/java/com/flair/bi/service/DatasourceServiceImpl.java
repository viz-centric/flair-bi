package com.flair.bi.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flair.bi.domain.Datasource;
import com.flair.bi.domain.DatasourceStatus;
import com.flair.bi.domain.QDatasource;
import com.flair.bi.repository.DatasourceRepository;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service Implementation for managing Datasource.
 */
@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class DatasourceServiceImpl implements DatasourceService {

	private final DatasourceRepository datasourceRepository;

	/**
	 * Save a datasource.
	 *
	 * @param datasource the entity to save
	 * @return the persisted entity
	 */
	@Override
	public Datasource save(Datasource datasource) {
		log.debug("Request to save Datasource : {}", datasource);
		return datasourceRepository.save(datasource);
	}

	private void init(Datasource datasource) {
	}

	/**
	 * Get all the datasources.
	 *
	 * @return the list of entities
	 */
	@Override
	@Transactional(readOnly = true)
	public List<Datasource> findAll(Predicate predicate) {
		log.debug("Request to get all Datasource");
		BooleanBuilder b = new BooleanBuilder(predicate);
		b.and(QDatasource.datasource.status.ne(DatasourceStatus.DELETED).or(QDatasource.datasource.status.isNull()));
		return StreamSupport.stream(datasourceRepository.findAll(b).spliterator(), false).peek(this::init)
				.collect(Collectors.toList());
	}

	@Override
	public Page<Datasource> findAll(Predicate predicate, Pageable pageable) {
		log.debug("Request to get all Datasource");
		final BooleanBuilder b = new BooleanBuilder(predicate);
		b.and(QDatasource.datasource.status.ne(DatasourceStatus.DELETED).or(QDatasource.datasource.status.isNull()));
		Page<Datasource> page = datasourceRepository.findAll(b, pageable);
		page.getContent().forEach(this::init);
		return page;

	}

	@Override
	public List<Datasource> findAllAndDeleted(Predicate predicate) {
		log.debug("Request to get all Datasource including deleted");
		return StreamSupport.stream(datasourceRepository.findAll(predicate).spliterator(), false).peek(this::init)
				.collect(Collectors.toList());
	}

	/**
	 * Get one datasources by id.
	 *
	 * @param id the id of the entity
	 * @return the entity
	 */
	@Override
	@Transactional(readOnly = true)
	public Datasource findOne(Long id) {
		log.debug("Request to get Datasource : {}", id);
		return datasourceRepository.getOne(id);
	}

	/**
	 * Delete the datasources by id.
	 *
	 * @param id the id of the entity
	 */
	@Override
	public void delete(Long id) {
		log.debug("Request to delete Datasource : {}", id);
		final Optional<Datasource> datasource = datasourceRepository.findById(id);
		datasource.ifPresent(x -> {
			x.setStatus(DatasourceStatus.DELETED);
			datasourceRepository.save(x);
		});

	}

	@Override
	@Transactional(readOnly = true)
	public Long getCount(Predicate predicate) {
		log.debug("Request to get Datasource count with predicate {}", predicate);
		BooleanBuilder b = new BooleanBuilder(predicate);
		b.and(QDatasource.datasource.status.ne(DatasourceStatus.DELETED).or(QDatasource.datasource.status.isNull()));
		return datasourceRepository.count(b);
	}

	/**
	 * Delete datasources by given predicate
	 *
	 * @param predicate predicate that defines deletion
	 */
	@Override
	public void delete(Predicate predicate) {
		BooleanBuilder b = new BooleanBuilder(predicate);
		b.and(QDatasource.datasource.status.ne(DatasourceStatus.DELETED).or(QDatasource.datasource.status.isNull()));
		final Iterable<Datasource> datasources = datasourceRepository.findAll(b);
		for (Datasource datasource : datasources) {
			datasource.setStatus(DatasourceStatus.DELETED);
		}
		datasourceRepository.saveAll(datasources);
	}

	@Override
	@Transactional(readOnly = true)
	public Page<Datasource> search(Pageable pageable, Predicate predicate) {
		log.debug("Request to get Seached Datasource");
		BooleanBuilder b = new BooleanBuilder(predicate);
		b.and(QDatasource.datasource.status.ne(DatasourceStatus.DELETED).or(QDatasource.datasource.status.isNull()));
		return datasourceRepository.findAll(b, pageable);
	}

	@Override
	@Transactional(readOnly = true)
	public List<Datasource> findAllByConnectionAndName(String connectionName, String datasourceName) {
		return findAll(QDatasource.datasource.connectionName.eq(connectionName)
				.and(QDatasource.datasource.name.eq(datasourceName)));
	}

	@Override
	public void deleteByConnectionAndName(String connectionName, String datasourceName) {
		delete(QDatasource.datasource.connectionName.eq(connectionName)
				.and(QDatasource.datasource.name.eq(datasourceName)));
	}

}
