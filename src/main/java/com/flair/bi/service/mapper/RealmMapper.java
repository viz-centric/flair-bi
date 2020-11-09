package com.flair.bi.service.mapper;

import com.flair.bi.domain.Realm;
import com.flair.bi.web.rest.dto.RealmDTO;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RealmMapper {

    RealmDTO toDTO(Realm realm);

    Realm fromDTO(RealmDTO realmDTO);

    List<Realm> fromDTOs(List<RealmDTO> realmDTOS);

    List<RealmDTO> toDTOs(List<Realm> realms);
}
