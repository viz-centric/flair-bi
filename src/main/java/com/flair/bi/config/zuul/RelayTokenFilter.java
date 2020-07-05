package com.flair.bi.config.zuul;

import java.util.Set;

import org.springframework.stereotype.Component;

import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;

@Component
public class RelayTokenFilter extends ZuulFilter {
	@Override
	public Object run() {
		RequestContext ctx = RequestContext.getCurrentContext();

		// Alter ignored headers as per:
		// https://gitter.im/spring-cloud/spring-cloud?at=56fea31f11ea211749c3ed22
		Set<String> headers = (Set<String>) ctx.get("ignoredHeaders");
		// We need our JWT tokens relayed to resource servers
		headers.remove("authorization");

		return null;
	}

	@Override
	public boolean shouldFilter() {
		return true;
	}

	@Override
	public String filterType() {
		return "pre";
	}

	@Override
	public int filterOrder() {
		return 10000;
	}
}
