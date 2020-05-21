package com.flair.bi.service.dto.scheduler;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class ChannelParametersDTO {
	private String id;
	private List<ConnectionPropertiesDTO> connectionProperties;
}
