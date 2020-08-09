package com.flair.bi.service.dto.scheduler;

public class AssignReport {
	private String channel[];
	private String slack_API_Token;
	private String channel_id;
	private String stride_API_Token;
	private String stride_cloud_id;
	private String stride_conversation_id;
	private CommunicationList communication_list;

	public AssignReport() {
	}

	public String[] getChannel() {
		return channel;
	}

	public void setChannel(String[] channel) {
		this.channel = channel;
	}

	public String getSlack_API_Token() {
		return slack_API_Token;
	}

	public void setSlack_API_Token(String slack_API_Token) {
		this.slack_API_Token = slack_API_Token;
	}

	public String getChannel_id() {
		return channel_id;
	}

	public void setChannel_id(String channel_id) {
		this.channel_id = channel_id;
	}

	public String getStride_API_Token() {
		return stride_API_Token;
	}

	public void setStride_API_Token(String stride_API_Token) {
		this.stride_API_Token = stride_API_Token;
	}

	public String getStride_cloud_id() {
		return stride_cloud_id;
	}

	public void setStride_cloud_id(String stride_cloud_id) {
		this.stride_cloud_id = stride_cloud_id;
	}

	public String getStride_conversation_id() {
		return stride_conversation_id;
	}

	public void setStride_conversation_id(String stride_conversation_id) {
		this.stride_conversation_id = stride_conversation_id;
	}

	public CommunicationList getCommunication_list() {
		return communication_list;
	}

	public void setCommunication_list(CommunicationList communication_list) {
		this.communication_list = communication_list;
	}

	@Override
	public String toString() {
		return "AssignReport [channel=" + channel + ", slack_API_Token=" + slack_API_Token + ", channel_id="
				+ channel_id + ", stride_API_Token=" + stride_API_Token + ", stride_cloud_id=" + stride_cloud_id
				+ ", stride_conversation_id=" + stride_conversation_id + ", communication_list=" + communication_list
				+ "]";
	}

}
