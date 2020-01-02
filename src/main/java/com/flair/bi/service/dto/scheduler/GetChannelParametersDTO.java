package com.flair.bi.service.dto.scheduler;
import java.util.List;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Getter
@Builder
@ToString
public class GetChannelParametersDTO {
	private String id;
	private  List<ConnectionPropertiesDTO> connectionProperties;
}
