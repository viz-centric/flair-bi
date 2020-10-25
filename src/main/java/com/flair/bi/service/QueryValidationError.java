package com.flair.bi.service;

import lombok.Value;

@Value(staticConstructor = "of")
public class QueryValidationError {
	String value;
	Error error;

	enum Error {
		RequiredConditionFeatureMissing, HavingValueInvalid, RestrictedFeatureUsed
	}
}
