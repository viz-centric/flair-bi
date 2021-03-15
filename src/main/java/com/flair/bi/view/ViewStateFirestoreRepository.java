package com.flair.bi.view;

import com.flair.bi.config.jackson.JacksonUtil;
import com.flair.bi.domain.ViewState;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import com.google.firebase.database.GenericTypeIndicator;
import lombok.SneakyThrows;
import org.apache.commons.lang3.NotImplementedException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public class ViewStateFirestoreRepository implements IViewStateRepository {

    private static final String COLLECTION = "view-state";
    private final Firestore db;

    public ViewStateFirestoreRepository() {
        db = FirestoreClient.getFirestore();
    }

    @SneakyThrows
    @Override
    public void add(ViewState viewState) {
        if (viewState.getId() == null) {
            viewState.setId(UUID.randomUUID().toString());
        }
        String strData = JacksonUtil.toString(viewState);
        Map<String, Object> map = JacksonUtil.fromString(strData, Map.class);

        List<Map> visualMetadataSet = (List<Map>) map.get("visualMetadataSet");
        visualMetadataSet.forEach(vm -> {
            List<?> properties = (List<?>) vm.get("properties");
            List<?> fields = (List<?>) vm.get("fields");
            Map<String, ?> metadataVisual = (Map<String, ?>) vm.get("metadataVisual");
            List<?> metadataVisualFieldTypes = (List<?>) metadataVisual.get("fieldTypes");
            List<?> metadataVisualPropertyTypes = (List<?>) metadataVisual.get("propertyTypes");

            vm.put("properties", null);
            vm.put("fields", null);
            vm.put("metadataVisual", null);
            metadataVisual.put("fieldTypes", null);
            metadataVisual.put("propertyTypes", null);
        });


        DocumentReference docRef = db.collection(COLLECTION).document(viewState.getId());
        docRef.set(map).get();
    }

    @Override
    public void update(ViewState viewState) {
        add(viewState);
    }

    @SneakyThrows
    @Override
    public void remove(ViewState viewState) {
        DocumentReference docRef = db.collection(COLLECTION).document(viewState.getId());
        docRef.delete().get();
    }

    @SneakyThrows
    @Override
    public ViewState get(String s) {
        DocumentReference docRef = db.collection(COLLECTION).document(s);
        DocumentSnapshot snapshot = docRef.get().get();
        GenericTypeIndicator<Map<String, Object>> t = new GenericTypeIndicator<Map<String, Object>>() {};
        ViewStateTypeIndicator map = snapshot.toObject(ViewStateTypeIndicator.class);
        String str = JacksonUtil.toString(map);
        return JacksonUtil.fromString(str, ViewState.class);
    }


    @Override
    public ViewState get(String s, String s1) {
        throw new NotImplementedException("get not implemented " + s + " " + s1);
    }

    @Override
    public List<ViewState> getAll() {
        throw new NotImplementedException("getAll not implemented");
    }

    @Override
    public boolean contains(String s) {
        throw new NotImplementedException("contains not implemented");
    }

}
