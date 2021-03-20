package com.flair.bi.view;

import com.flair.bi.config.jackson.JacksonUtil;
import com.flair.bi.domain.ViewState;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.WriteResult;
import com.google.common.base.Splitter;
import com.google.common.collect.Lists;
import com.google.firebase.cloud.FirestoreClient;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.NotImplementedException;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.stream.Collectors;

@Slf4j
public class ViewStateFirestoreRepository implements IViewStateRepository {

    private static final String COLLECTION = "view-state";
    private static final int CHUNK_SIZE = 100_000;

    private final Firestore db;
    private final ExecutorService executorService = Executors.newWorkStealingPool();

    public ViewStateFirestoreRepository() {
        db = FirestoreClient.getFirestore();
    }

    @SneakyThrows
    @Override
    public void add(ViewState viewState) {
        log.info("Create view state {}", viewState.getId());
        if (viewState.getId() == null) {
            viewState.setId(UUID.randomUUID().toString());
        }

        remove(viewState);

        String strData = JacksonUtil.toString(viewState);
        List<String> tokens = Lists.newArrayList(Splitter.fixedLength(CHUNK_SIZE).split(strData));

        List<Future<?>> futures = new ArrayList<>();

        futures.add(saveDocumentValue(viewState, "tokensCount", tokens.size()));

        for (int i = 0; i < tokens.size(); i++) {
            String t = tokens.get(i);
            futures.add(saveDocumentValue(viewState, "token." + i, t));
        }

        waitAllFutures(futures);
    }

//    @SneakyThrows
//    private void saveDocumentMap(ViewState viewState, String subkey, Map<String, ?> map) throws RuntimeException {
//        DocumentReference docRef = db.collection(COLLECTION).document(viewState.getId() + "." + subkey);
//        docRef.set(map).get();
//    }

    @SneakyThrows
    private ApiFuture<WriteResult> saveDocumentList(ViewState viewState, String subkey, List<?> list) throws RuntimeException {
        log.debug("saving document {} key {}", viewState.getId(), subkey);
        DocumentReference docRef = db.collection(COLLECTION).document(viewState.getId() + "." + subkey);
        HashMap<String, Object> map = new HashMap<>();
        map.put("list", list);
        return docRef.set(map);
    }

    @SneakyThrows
    private ApiFuture<WriteResult> saveDocumentValue(ViewState viewState, String subkey, Object value) throws RuntimeException {
        return saveDocumentList(viewState, subkey, Arrays.asList(value));
    }

    @SneakyThrows
    private List<?> getDocumentList(String documentId, String subkey) throws RuntimeException {
        DocumentReference docRef = db.collection(COLLECTION).document(documentId + "." + subkey);
        DocumentSnapshot snapshot = docRef.get().get();
        Map<String, Object> map = snapshot.getData();
        if (map == null || map.isEmpty()) {
            return null;
        }
        String str = JacksonUtil.toString(map.get("list"));
        return JacksonUtil.fromString(str, List.class);
    }

    @SneakyThrows
    private <T> T getDocumentValue(String documentId, String subkey) throws RuntimeException {
        List<?> list = getDocumentList(documentId, subkey);
        if (list == null || list.isEmpty()) {
            return null;
        }
        T value = (T) list.get(0);
        log.debug("reading document {} key {} = {}", documentId, subkey, shrinkValue(String.valueOf(value)));
        return value;
    }

    private String shrinkValue(String str) {
        int printSize = 50;
        return str.substring(0, Math.min(printSize, str.length())) + "...[" + str.length() + "]..." + str.substring(Math.max(0, str.length() - printSize));
    }

//    @SneakyThrows
//    private Map<String, ?> getDocumentMap(String documentId, String subkey) throws RuntimeException {
//        DocumentReference docRef = db.collection(COLLECTION).document(documentId + "." + subkey);
//        DocumentSnapshot snapshot = docRef.get().get();
//        Map<String, Object> viewStateTypeIndicator = snapshot.getData();
//        String str = JacksonUtil.toString(viewStateTypeIndicator);
//        return JacksonUtil.fromString(str, Map.class);
//    }

    @Override
    public void update(ViewState viewState) {
        add(viewState);
    }

    @SneakyThrows
    @Override
    public void remove(ViewState viewState) {
        String vId = viewState.getId();

        log.info("Remove view state {}", vId);

        Integer tokensCount = getDocumentValue(vId, "tokensCount");
        if (tokensCount == null) {
            return;
        }

        List<Future<?>> futures = new ArrayList<>();
        for (long i = 0; i < tokensCount; i++) {
            futures.add(deleteDocument(vId + ".token." + i));
        }

        futures.add(deleteDocument(vId + ".tokensCount"));

        waitAllFutures(futures);
    }

    private void waitAllFutures(List<Future<?>> futures) {
        futures.forEach(f -> doUnchecked(() -> f.get()));
    }

    @SneakyThrows
    private ApiFuture<WriteResult> deleteDocument(String documentName) {
        log.debug("Deleting document {}", documentName);
        DocumentReference docRef = db.collection(COLLECTION).document(documentName);
        return docRef.delete();
    }

    @SneakyThrows
    @Override
    public ViewState get(String s) {
        log.info("Get view state {}", s);
        Integer tokensCount = getDocumentValue(s, "tokensCount");
        if (tokensCount == null) {
            return null;
        }

        List<Future<String>> futures = new ArrayList<>();
        for (int i = 0; i < tokensCount; i++) {
            int finalI = i;
            futures.add(
                    executorService.submit(() -> getDocumentValue(s, "token." + finalI))
            );
        }
        String str = futures.stream()
                .map(f -> doUnchecked(() -> f.get()))
                .collect(Collectors.joining());

        return JacksonUtil.fromString(str, ViewState.class);
    }

    private static <T> T doUnchecked(Callable<T> callable) {
        try {
            return callable.call();
        } catch (Throwable t) {
            throw new RuntimeException(t);
        }
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
