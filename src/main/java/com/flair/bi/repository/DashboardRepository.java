package com.flair.bi.repository;

import com.flair.bi.domain.Dashboard;
import com.flair.bi.domain.QDashboard;
import com.querydsl.core.types.dsl.SimpleExpression;
import com.querydsl.core.types.dsl.StringExpression;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.data.querydsl.binding.QuerydslBinderCustomizer;
import org.springframework.data.querydsl.binding.QuerydslBindings;

import java.util.List;

/**
 * Spring Data JPA repository for the Dashboard entity.
 */
public interface DashboardRepository extends JpaRepository<Dashboard, Long>, QuerydslPredicateExecutor<Dashboard>,
		QuerydslBinderCustomizer<QDashboard> {

	Dashboard findByDashboardViews(Long id);

	List<Dashboard> findByDashboardDatasourceIdIn(List<Long> datasourceIdList);

	/**
	 * Customize the {@link QuerydslBindings} for the given root.
	 *
	 * @param bindings the {@link QuerydslBindings} to customize, will never be
	 *                 {@literal null}.
	 * @param root     the entity root, will never be {@literal null}.
	 */
	default void customize(QuerydslBindings bindings, QDashboard root) {
		bindings.bind(root.dashboardName).first(StringExpression::containsIgnoreCase);
		bindings.bind(root.description).first(StringExpression::containsIgnoreCase);
		bindings.bind(root.dashboardDatasource.id).first(SimpleExpression::eq);
	}
}
