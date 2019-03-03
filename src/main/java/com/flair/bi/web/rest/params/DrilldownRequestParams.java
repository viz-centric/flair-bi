package com.flair.bi.web.rest.params;

import com.flair.bi.domain.Datasource;
import com.flair.bi.domain.QView;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Expression;
import com.querydsl.core.types.Predicate;
import com.querydsl.jpa.JPAExpressions;

import java.util.Optional;

public class DrilldownRequestParams implements RequestPredicate<Predicate> {

    private Long view;

    @Override
    public Predicate getRequestPredicate() {
        return Optional.ofNullable(view)
            .map(x -> {

                    Expression<Datasource> jpaExpressions = JPAExpressions.select(QView.view.viewDashboard.dashboardDatasource)
                        .from(QView.view)
                        .where(QView.view.id.eq(view));
                    BooleanBuilder b = new BooleanBuilder();


                    return b;

                }
            ).orElseGet(BooleanBuilder::new);
    }
}
