package com.flair.bi.repository;

import com.flair.bi.domain.Datasource;
import com.flair.bi.domain.QDatasource;
import com.querydsl.core.types.dsl.SimpleExpression;
import com.querydsl.core.types.dsl.StringExpression;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;
import org.springframework.data.querydsl.binding.QuerydslBinderCustomizer;
import org.springframework.data.querydsl.binding.QuerydslBindings;
import org.springframework.stereotype.Repository;

import java.util.List;


/**
 * Spring Data JPA repository for the Datasource entity.
 */
@SuppressWarnings("unused")
@Repository
public interface DatasourceRepository extends JpaRepository<Datasource, Long>,
    QueryDslPredicateExecutor<Datasource>,
    QuerydslBinderCustomizer<QDatasource> {

    @Override
    default void customize(QuerydslBindings querydslBindings, QDatasource qDatasource) {
        querydslBindings.bind(qDatasource.connectionName).first(SimpleExpression::eq);
        querydslBindings.bind(qDatasource.name).first(StringExpression::containsIgnoreCase);
    }
}
