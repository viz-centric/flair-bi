package com.flair.bi.domain.listeners;

import com.flair.bi.domain.visualmetadata.VisualMetadata;

public class VisualMetadataListener {

	public static void addParents(VisualMetadata visualMetadata) {
		visualMetadata.getFields()
				.forEach(x -> x.getProperties().stream().filter(y -> y.getField() == null).forEach(z -> z.setField(x)));
	}

}
