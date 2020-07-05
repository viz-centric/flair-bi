package com.flair.bi.ssl;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.InetAddress;
import java.net.Socket;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.UnrecoverableKeyException;
import java.security.cert.CertificateException;
import java.util.Properties;

import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSocketFactory;

import org.apache.http.ssl.SSLContextBuilder;

import lombok.extern.slf4j.Slf4j;

/**
 * Flair bi SSL Socket Factory that is used when communicating with Postgresql
 * <p>
 * This class must not be part of the Spring ecosystem because it will be
 * instantiated by the Postgres JDBC driver
 * <p>
 * Requirements fully working SSL is that following environment variables needs
 * to be set:
 * <p>
 * 1. FLAIRBI_PGSQL_TRUST_STORE_PATH - path of the trust store containing CA
 * certificate 2. FLAIRBI_PGSQL_TRUST_STORE_PASS - password for the trust store
 * above 3. FLAIRBI_PGSQL_KEY_STORE_PATH - path of the key store that contains
 * flair bi certificate 4. FLAIRBI_PGSQL_KEY_STORE_PASS - password for the
 * keystore above 5. FLAIRBI_PGSQL_KEY_PASS - password for the key that is
 * binded to flair bi certificate
 * <p>
 * or you can pass String arg to the class where you define properties file
 * <p>
 * The name of the properties is in order as defined above:
 * <p>
 * 1. truststore.path 2. truststore.pass 3. keystore.path 4. keystore.pass 5.
 * keystore.key.pass
 * 
 * @version 1.0
 */
@Slf4j
public class FlairBIPgSqlSSLSocketFactory extends SSLSocketFactory {

	private SSLSocketFactory sslSocketFactory;

	public FlairBIPgSqlSSLSocketFactory(String arg) {
		if (arg == null) {
			this.sslSocketFactory = constructSocketFactory();
		} else {
			this.sslSocketFactory = constructSocketFactory(arg);
		}

	}

	/**
	 * Construct ssl socket factory based on file path
	 *
	 * @param arg path to file configuration
	 * @return ssl factory or null if error occurs
	 */
	private SSLSocketFactory constructSocketFactory(String arg) {
		File confFile = new File(arg);

		checkFileRequirements(confFile);

		Properties prop = new Properties();

		try (InputStream input = new FileInputStream(confFile)) {

			// load a properties file
			prop.load(input);

			String keyStore = prop.getProperty("keystore.path");
			String trustStore = prop.getProperty("truststore.path");
			String keyStorePassword = prop.getProperty("keystore.pass");
			String trustStorePassword = prop.getProperty("truststore.pass");
			String keyPassword = prop.getProperty("keystore.key.pass");

			checkNotNull(trustStore, "Trust store path is null");
			checkNotNull(trustStorePassword, "Trust store password is null");
			checkNotNull(keyStore, "Key store path is null");
			checkNotNull(keyStorePassword, "Key store password is null");
			checkNotNull(keyPassword, "Key password is null");

			File trustStoreFile = new File(trustStore);
			File keyStoreFile = new File(keyStore);

			checkFileRequirements(trustStoreFile);
			checkFileRequirements(keyStoreFile);

			SSLContext sslContext = new SSLContextBuilder()
					.loadTrustMaterial(trustStoreFile, trustStorePassword.toCharArray())
					.loadKeyMaterial(keyStoreFile, keyStorePassword.toCharArray(), keyPassword.toCharArray()).build();

			return sslContext.getSocketFactory();
		} catch (IOException | KeyManagementException | KeyStoreException | UnrecoverableKeyException
				| NoSuchAlgorithmException | CertificateException ex) {
			log.error("Error creating ssl socket context", ex);
		}
		return null;
	}

	/**
	 * Constructs ssl factory based on environment variables
	 *
	 * @return ssl factory or null if error occurs
	 */
	private SSLSocketFactory constructSocketFactory() {

		String trustStore = System.getenv("FLAIRBI_PGSQL_TRUST_STORE_PATH");
		String trustStorePassword = System.getenv("FLAIRBI_PGSQL_TRUST_STORE_PASS");
		String keyStore = System.getenv("FLAIRBI_PGSQL_KEY_STORE_PATH");
		String keyStorePassword = System.getenv("FLAIRBI_PGSQL_KEY_STORE_PASS");
		String keyPassword = System.getenv("FLAIRBI_PGSQL_KEY_PASS");

		try {
			checkNotNull(trustStore, "Trust store path is null");
			checkNotNull(trustStorePassword, "Trust store password is null");
			checkNotNull(keyStore, "Key store path is null");
			checkNotNull(keyStorePassword, "Key store password is null");
			checkNotNull(keyPassword, "Key password is null");
		} catch (IllegalArgumentException e) {
			log.error(e.getMessage());
			return null;
		}

		File trustStoreFile = new File(trustStore);
		File keyStoreFile = new File(keyStore);

		try {
			checkFileRequirements(trustStoreFile);
			checkFileRequirements(keyStoreFile);
		} catch (IllegalArgumentException e) {
			log.error(e.getMessage());
			return null;
		}

		try {
			SSLContext sslContext = new SSLContextBuilder()
					.loadTrustMaterial(trustStoreFile, trustStorePassword.toCharArray())
					.loadKeyMaterial(keyStoreFile, keyStorePassword.toCharArray(), keyPassword.toCharArray()).build();

			return sslContext.getSocketFactory();
		} catch (NoSuchAlgorithmException | KeyStoreException | IOException | CertificateException
				| UnrecoverableKeyException | KeyManagementException e) {
			log.error("Error creating a socket factory", e);
		}
		return null;
	}

	private void checkFileRequirements(File file) {
		if (file == null) {
			throw new IllegalArgumentException("File cannot be null");
		}

		if (!file.exists()) {
			throw new IllegalArgumentException("File " + file.getAbsolutePath() + " does not exist");
		}

		if (file.isDirectory()) {
			throw new IllegalArgumentException("File " + file.getAbsolutePath() + " is a directory!");
		}

		if (!file.canRead()) {
			throw new IllegalArgumentException("File " + file.getAbsolutePath() + " cannot be read");
		}
	}

	private void checkNotNull(Object object, String msg) {
		if (object == null) {
			throw new IllegalArgumentException(msg);
		}
	}

	@Override
	public String[] getDefaultCipherSuites() {
		return sslSocketFactory.getDefaultCipherSuites();
	}

	@Override
	public String[] getSupportedCipherSuites() {
		return sslSocketFactory.getSupportedCipherSuites();
	}

	@Override
	public Socket createSocket(Socket socket, String s, int i, boolean b) throws IOException {
		return sslSocketFactory.createSocket(socket, s, i, b);
	}

	@Override
	public Socket createSocket() throws IOException {
		return sslSocketFactory.createSocket();
	}

	@Override
	public Socket createSocket(Socket socket, InputStream inputStream, boolean b) throws IOException {
		return sslSocketFactory.createSocket(socket, inputStream, b);
	}

	@Override
	public Socket createSocket(String s, int i) throws IOException {
		return sslSocketFactory.createSocket(s, i);
	}

	@Override
	public Socket createSocket(String s, int i, InetAddress inetAddress, int i1) throws IOException {
		return sslSocketFactory.createSocket(s, i, inetAddress, i1);
	}

	@Override
	public Socket createSocket(InetAddress inetAddress, int i) throws IOException {
		return sslSocketFactory.createSocket(inetAddress, i);
	}

	@Override
	public Socket createSocket(InetAddress inetAddress, int i, InetAddress inetAddress1, int i1) throws IOException {
		return sslSocketFactory.createSocket(inetAddress, i, inetAddress1, i1);
	}

}
