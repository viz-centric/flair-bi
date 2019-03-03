package com.flair.bi.repository;

import com.flair.bi.domain.EntityAuditEvent;
import com.flair.bi.domain.QEntityAuditEvent;
import com.querydsl.core.types.dsl.SimpleExpression;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;
import org.springframework.data.querydsl.binding.QuerydslBinderCustomizer;
import org.springframework.data.querydsl.binding.QuerydslBindings;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Spring Data JPA repository for the EntityAuditEvent entity.
 */
public interface EntityAuditEventRepository extends JpaRepository<EntityAuditEvent, Long>,
    QueryDslPredicateExecutor<EntityAuditEvent>,
    QuerydslBinderCustomizer<QEntityAuditEvent> {

    List<EntityAuditEvent> findAllByEntityTypeAndEntityId(String entityType, Long entityId);

    @Query("SELECT max(a.commitVersion) FROM EntityAuditEvent a where a.entityType = :type and a.entityId = :entityId")
    Integer findMaxCommitVersion(@Param("type") String type, @Param("entityId") Long entityId);

    @Query("SELECT DISTINCT (a.entityType) from EntityAuditEvent a")
    List<String> findAllEntityTypes();

    Page<EntityAuditEvent> findAllByEntityType(String entityType, Pageable pageRequest);

    @Query("SELECT ae FROM EntityAuditEvent ae where ae.entityType = :type and ae.entityId = :entityId and " +
        "ae.commitVersion =(SELECT max(a.commitVersion) FROM EntityAuditEvent a where a.entityType = :type and " +
        "a.entityId = :entityId and a.commitVersion < :commitVersion)")
    EntityAuditEvent findOneByEntityTypeAndEntityIdAndCommitVersion(@Param("type") String type, @Param("entityId")
        Long entityId, @Param("commitVersion") Integer commitVersion);

    /**
     * Customize the {@link QuerydslBindings} for the given root.
     *
     * @param bindings the {@link QuerydslBindings} to customize, will never be {@literal null}.
     * @param root     the entity root, will never be {@literal null}.
     */
    @Override
    default void customize(QuerydslBindings bindings, QEntityAuditEvent root) {
        bindings.bind(root.entityType).first(SimpleExpression::eq);
        bindings.bind(root.action).first(SimpleExpression::eq);
        bindings.excluding(root.modifiedBy);
    }
}
