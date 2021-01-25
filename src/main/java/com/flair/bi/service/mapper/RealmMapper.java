package com.flair.bi.service.mapper;

import com.flair.bi.domain.Realm;
import com.flair.bi.web.rest.dto.RealmDTO;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RealmMapper {

    default RealmDTO toDTO(Realm realm) {
        RealmDTO realmDTO = new RealmDTO();
        realmDTO.setName(realm.getName());
        realmDTO.setId(realm.getId());
        if (realm.getRealmCreationToken() != null) {
            realmDTO.setToken(realm.getRealmCreationToken().getToken());
        }
        return realmDTO;
    }

    Realm fromDTO(RealmDTO realmDTO);

    List<Realm> fromDTOs(List<RealmDTO> realmDTOS);

    List<RealmDTO> toDTOs(List<Realm> realms);
}
