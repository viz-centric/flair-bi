package com.flair.bi.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.data.querydsl.binding.QuerydslBinderCustomizer;
import org.springframework.data.querydsl.binding.QuerydslBindings;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.flair.bi.domain.Datasource;
import com.flair.bi.domain.QDatasource;
import com.querydsl.core.types.dsl.SimpleExpression;
import com.querydsl.core.types.dsl.StringExpression;

/**
 * Spring Data JPA repository for the Datasource entity.
 */
@Repository
public interface DatasourceRepository extends JpaRepository<Datasource, Long>, QuerydslPredicateExecutor<Datasource>,
		QuerydslBinderCustomizer<QDatasource> {

	@Override
	@Query("select c from Datasource c where c.status is null or c.status <> com.flair.bi.domain.DatasourceStatus.DELETED")
	Page<Datasource> findAll(Pageable pageable);

	@Modifying
	@Query("delete from Datasource d where d.realm.id = :id")
	void deleteAllByRealmId(@Param("id") Long id);

	@Override
	default void customize(QuerydslBindings querydslBindings, QDatasource qDatasource) {
		querydslBindings.bind(qDatasource.connectionName).first(SimpleExpression::eq);
		querydslBindings.bind(qDatasource.name).first(StringExpression::containsIgnoreCase);
	}
}
