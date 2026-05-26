import * as React from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { enableScreens } from "react-native-screens";
import axios from "axios";

import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updatePassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
} from "firebase/firestore";

enableScreens();

const firebaseConfig = {
  apiKey: "AIzaSyDn4FCYnOVTjDyyHfO5Sfxiq3OOJ-xRN-8",
  authDomain: "conheca-o-mundo-aab60.firebaseapp.com",
  projectId: "conheca-o-mundo-aab60",
  storageBucket: "conheca-o-mundo-aab60.firebasestorage.app",
  messagingSenderId: "1061853145254",
  appId: "1:1061853145254:web:e07b28f80f22ccaf0eec67",
  measurementId: "G-KM6WE5N7QM",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Serve para compartilhar o Usuário e os Favoritos entre todas as telas.
const AppContext = React.createContext();

const AppProvider = ({ children }) => {
  const [user, setUser] = React.useState(null);
  const [favoritosGlobais, setFavoritosGlobais] = React.useState([]);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usuarioAtual) => {
      setUser(usuarioAtual);
    });
    return unsubscribe;
  }, []);

  // Busca os favoritos da nuvem (Firestore) em tempo real
  React.useEffect(() => {
    if (!user) return;
    const favRef = collection(db, "usuarios", user.uid, "favoritos");
    const unsubscribe = onSnapshot(favRef, (snapshot) => {
      const listaFavs = snapshot.docs.map((doc) => doc.id);
      setFavoritosGlobais(listaFavs);
    });
    return unsubscribe;
  }, [user]);

  // Função para adicionar/remover favorito no banco de dados
  const alternarFavorito = async (codigoPais) => {
    if (!user) return;
    const docRef = doc(db, "usuarios", user.uid, "favoritos", codigoPais);
    try {
      if (favoritosGlobais.includes(codigoPais)) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { adicionadoEm: new Date().toISOString() });
      }
    } catch (error) {
      console.log("Erro ao favoritar: ", error);
    }
  };

  return (
    <AppContext.Provider value={{ user, favoritosGlobais, alternarFavorito }}>
      {children}
    </AppContext.Provider>
  );
};

function HomeScreen({ navigation }) {
  const [email, setEmail] = React.useState("");
  const [senha, setSenha] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const fazerLogin = async () => {
    const emailTratado = email.trim();
    if (!emailTratado || !senha) {
      Alert.alert("Erro", "Preencha email e senha");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, emailTratado, senha);
      navigation.replace("Pais");
    } catch (error) {
      Alert.alert("Erro", "Email ou senha incorreta!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.containerApp}>
      <View style={styles.header}></View>
      <View style={styles.mainCard}>
        <View style={styles.mainCardImage}>
          <Image
            source={{
              uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0XaTyIED4Ho54dARu0uOrfBjgVAWOb0Tm-w&s",
            }}
            style={{ width: 150, height: 150 }}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.sectionTitle}>Conheça O Mundo</Text>
        <Text style={styles.SmallText}>Explore. Descubra. Viaje.</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.inputModern}
          value={email}
          onChangeText={setEmail}
          placeholder="Digite seu email"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.inputModern}
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          placeholder="Digite sua senha"
        />

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={fazerLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("Cadastro")}
        >
          <Text style={styles.secondaryButtonText}>
            Ainda não tem conta? Cadastre-se
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function CadastroScreen({ navigation }) {
  const [email, setEmail] = React.useState("");
  const [senha, setSenha] = React.useState("");

  const cadastrar = async () => {
    const emailTratado = email.trim();
    if (!emailTratado || !senha) {
      Alert.alert("Erro", "Preencha email e senha");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, emailTratado, senha);
      Alert.alert("Sucesso", "Cadastro realizado!", [
        { text: "OK", onPress: () => navigation.replace("Pais") },
      ]);
    } catch (error) {
      let msgErro = error.message;
      if (error.code === "auth/email-already-in-use")
        msgErro = "Esse e-mail já está cadastrado!";
      if (error.code === "auth/weak-password")
        msgErro = "A senha precisa ter pelo menos 6 caracteres.";
      Alert.alert("Erro no Cadastro", msgErro);
    }
  };

  return (
    <View style={styles.containerApp}>
      <View style={styles.header}></View>
      <View style={styles.mainCard}>
        <Text style={styles.sectionTitle}>Novo usuário</Text>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.inputModern}
          value={email}
          onChangeText={setEmail}
          placeholder="Digite seu email"
          autoCapitalize="none"
        />
        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.inputModern}
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          placeholder="Mínimo 6 caracteres"
        />
        <TouchableOpacity style={styles.primaryButton} onPress={cadastrar}>
          <Text style={styles.primaryButtonText}>Cadastrar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryButtonText}>Já tenho conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function PaisScreen({ navigation }) {
  const [paises, setPaises] = React.useState([]);
  const [busca, setBusca] = React.useState("");
  const { favoritosGlobais, alternarFavorito } = React.useContext(AppContext);

  const buscarNaApi = async (textoDaBusca) => {
    try {
      let url =
        "https://restcountries.com/v3.1/all?fields=name,capital,flags,cca3";
      if (textoDaBusca.trim() !== "") {
        url = `https://restcountries.com/v3.1/name/${textoDaBusca.trim()}?fields=name,capital,flags,cca3`;
      }
      const res = await axios.get(url);
      setPaises(res.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setPaises([]);
      } else {
        console.log(error);
      }
    }
  };

  React.useEffect(() => {
    buscarNaApi("");
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f3f7" }}>
      <View style={styles.top}>
        <Text style={styles.title}>Países</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Digite e aperte enter..."
          placeholderTextColor="#888"
          value={busca}
          onChangeText={setBusca}
          onSubmitEditing={() => buscarNaApi(busca)}
          returnKeyType="search"
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 90 }}>
        {paises.map((item, i) => {
          const nome = item.name?.common || "Sem nome";
          const capital = item.capital?.[0] || "Sem capital";
          const isFav = favoritosGlobais.includes(item.cca3);

          return (
            <TouchableOpacity
              key={i}
              style={styles.cardCurrency}
              onPress={() => navigation.navigate("Detalhes", { pais: item })}
            >
              <View style={styles.row}>
                <Image source={{ uri: item.flags?.png }} style={styles.flag} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.code}>{nome}</Text>
                  <Text style={styles.desc}>Capital: {capital}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => alternarFavorito(item.cca3)}
                  style={{ padding: 10 }}
                >
                  <Text style={{ fontSize: 24, color: isFav ? "red" : "gray" }}>
                    {isFav ? "❤️" : "🤍"}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.bottomMenu}>
        <TouchableOpacity onPress={() => navigation.navigate("Pais")}>
          <Text style={styles.menuTextActive}>🌎 Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Favoritos")}>
          <Text style={styles.menuText}>❤️ Favoritos</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Perfil")}>
          <Text style={styles.menuText}>👤 Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const DetailRow = ({ icon, label, value }) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 10,
    }}
  >
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Text
        style={{ fontSize: 16, width: 28, textAlign: "left", color: "#666" }}
      >
        {icon}
      </Text>
      <Text style={{ fontSize: 14, color: "#444", fontWeight: "500" }}>
        {label}
      </Text>
    </View>
    <Text
      style={{
        fontSize: 14,
        fontWeight: "600",
        color: "#222",
        flex: 1,
        textAlign: "right",
      }}
    >
      {value}
    </Text>
  </View>
);

function DetalhesScreen({ route, navigation }) {
  const { pais } = route.params;
  const { favoritosGlobais, alternarFavorito } = React.useContext(AppContext);
  const isFav = favoritosGlobais.includes(pais.cca3);

  const [fullData, setFullData] = React.useState(null);

  React.useEffect(() => {
    const fetchDetalhesCompletos = async () => {
      try {
        const res = await axios.get(
          `https://restcountries.com/v3.1/alpha/${pais.cca3}`,
        );
        setFullData(res.data[0]);
      } catch (error) {
        console.log("Erro ao buscar detalhes completos do país:", error);
      }
    };
    fetchDetalhesCompletos();
  }, [pais.cca3]);

  const dados = fullData || pais;
  const nome = dados.name?.common || "Carregando...";
  const nomeOficial = dados.name?.official || "";
  const capital = dados.capital?.[0] || "-";

  const populacao = fullData?.population
    ? fullData.population.toLocaleString("pt-BR")
    : "-";
  const idioma = fullData?.languages
    ? Object.values(fullData.languages).join(", ")
    : "-";

  const moedasObj = fullData?.currencies || {};
  const moedaKeys = Object.keys(moedasObj);
  const moeda =
    moedaKeys.length > 0
      ? `${moedasObj[moedaKeys[0]].name} (${moedaKeys[0]})`
      : "-";

  const regiao = fullData?.region || "-";
  const subRegiao = fullData?.subregion || "-";
  const continente = fullData?.continents?.[0] || "-";
  const fusoHorario = fullData?.timezones?.[0] || "-";

  const coverImage =
    "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1000&q=80";

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Cabeçalho Azul Fixo */}
      <View
        style={{
          backgroundColor: "#125bd4",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: Platform.OS === "ios" ? 50 : 35,
          paddingBottom: 15,
          paddingHorizontal: 15,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: "#fff", fontSize: 24 }}>{"\u2190"}</Text>
        </TouchableOpacity>
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
          Detalhes do País
        </Text>
        <TouchableOpacity onPress={() => alternarFavorito(pais.cca3)}>
          <Text style={{ color: "#fff", fontSize: 22 }}>
            {isFav ? "♥" : "♡"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        bounces={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Banner de Imagem Fundo */}
        <Image
          source={{ uri: coverImage }}
          style={{ width: "100%", height: 230 }}
        />

        {/* Card Branco Arredondado */}
        <View
          style={{
            backgroundColor: "#fff",
            marginTop: -25,
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25,
            paddingHorizontal: 20,
            paddingTop: 55,
          }}
        >
          {/* Bandeira Sobreposta */}
          <View
            style={{
              position: "absolute",
              top: -30,
              left: 20,
              width: 80,
              height: 60,
              backgroundColor: "#fff",
              borderRadius: 10,
              elevation: 4,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              overflow: "hidden",
            }}
          >
            <Image
              source={{ uri: dados.flags?.png }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          </View>

          {/* Textos de Título */}
          <Text style={{ fontSize: 28, fontWeight: "bold", color: "#111" }}>
            {nome}
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: "#888",
              marginTop: 2,
              marginBottom: 25,
            }}
          >
            {nomeOficial}
          </Text>

          {/* Lista de Atributos */}
          <DetailRow icon="📍" label="Capital" value={capital} />
          <DetailRow icon="👥" label="População" value={populacao} />
          <DetailRow icon="📖" label="Idioma" value={idioma} />
          <DetailRow icon="💲" label="Moeda" value={moeda} />
          <DetailRow icon="📍" label="Região" value={regiao} />
          <DetailRow icon="🌐" label="Sub-região" value={subRegiao} />
          <DetailRow icon="🗺️" label="Continente" value={continente} />
          <DetailRow icon="🕒" label="Fuso horário" value={fusoHorario} />

          {/* Botão Inferior de Favorito */}
          <TouchableOpacity
            style={{
              backgroundColor: "#125bd4",
              padding: 16,
              borderRadius: 14,
              marginTop: 35,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => alternarFavorito(pais.cca3)}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                marginRight: 10,
                fontWeight: "bold",
              }}
            >
              {isFav ? "❤️" : "🤍"}
            </Text>
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
              {isFav ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function FavoritosScreen({ navigation }) {
  const [paisesFavs, setPaisesFavs] = React.useState([]);
  const { favoritosGlobais } = React.useContext(AppContext);

  React.useEffect(() => {
    const carregarFavoritos = async () => {
      if (favoritosGlobais.length === 0) {
        setPaisesFavs([]);
        return;
      }
      try {
        const codes = favoritosGlobais.join(",");
        const res = await axios.get(
          `https://restcountries.com/v3.1/alpha?codes=${codes}&fields=name,capital,flags,cca3`,
        );
        setPaisesFavs(res.data);
      } catch (error) {
        console.log("Erro ao buscar detalhes dos favoritos", error);
      }
    };
    carregarFavoritos();
  }, [favoritosGlobais]);

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f3f7" }}>
      <View style={styles.top}>
        <Text style={styles.title}>Meus Destinos</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 15 }}>
        {paisesFavs.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 50 }}>
            Nenhum país favoritado ainda.
          </Text>
        ) : (
          paisesFavs.map((item, i) => (
            <View key={i} style={styles.cardCurrency}>
              <View style={styles.row}>
                <Image source={{ uri: item.flags?.png }} style={styles.flag} />
                <View>
                  <Text style={styles.code}>{item.name.common}</Text>
                  <Text style={styles.desc}>Capital: {item.capital?.[0]}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      <View style={styles.bottomMenu}>
        <TouchableOpacity onPress={() => navigation.navigate("Pais")}>
          <Text style={styles.menuText}>🌎 Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Favoritos")}>
          <Text style={styles.menuTextActive}>❤️ Favoritos</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Perfil")}>
          <Text style={styles.menuText}>👤 Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function PerfilScreen({ navigation }) {
  const { user } = React.useContext(AppContext);
  const [novaSenha, setNovaSenha] = React.useState("");

  const alterarSenha = async () => {
    if (!novaSenha || novaSenha.length < 6) {
      Alert.alert("Erro", "A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    try {
      await updatePassword(user, novaSenha);
      Alert.alert("Sucesso", "Senha alterada com sucesso!");
      setNovaSenha("");
    } catch (error) {
      if (error.code === "auth/requires-recent-login") {
        Alert.alert(
          "Atenção",
          "Por segurança, faça logout e login novamente para trocar a senha.",
        );
      } else {
        Alert.alert("Erro", error.message);
      }
    }
  };

  const deslogar = async () => {
    await signOut(auth);
    navigation.replace("Home");
  };

  return (
    <View style={styles.containerApp}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
      </View>
      <View style={styles.mainCard}>
        <Text style={styles.code}>Logado como:</Text>
        <Text style={styles.desc}>{user?.email}</Text>

        <View style={{ marginTop: 30 }}>
          <Text style={styles.label}>Alterar Senha</Text>
          <TextInput
            style={styles.inputModern}
            value={novaSenha}
            onChangeText={setNovaSenha}
            secureTextEntry
            placeholder="Digite a nova senha"
          />
          <TouchableOpacity style={styles.primaryButton} onPress={alterarSenha}>
            <Text style={styles.primaryButtonText}>Atualizar Senha</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.secondaryButton, { marginTop: 40 }]}
          onPress={deslogar}
        >
          <Text style={[styles.secondaryButtonText, { color: "red" }]}>
            Sair da Conta
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.bottomMenu,
          { position: "absolute", bottom: 0, width: "100%" },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.navigate("Pais")}>
          <Text style={styles.menuText}>🌎 Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Favoritos")}>
          <Text style={styles.menuText}>❤️ Favoritos</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Perfil")}>
          <Text style={styles.menuTextActive}>👤 Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Cadastro" component={CadastroScreen} />
          <Stack.Screen name="Pais" component={PaisScreen} />
          <Stack.Screen name="Detalhes" component={DetalhesScreen} />
          <Stack.Screen name="Favoritos" component={FavoritosScreen} />
          <Stack.Screen name="Perfil" component={PerfilScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  containerApp: { flex: 1, backgroundColor: "#e3f3fe" },
  header: {
    backgroundColor: "#e3f3fe",
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: { color: "#2c5ac8", fontSize: 24, fontWeight: "bold" },
  mainCard: {
    backgroundColor: "#fff",
    margin: 20,
    marginTop: -30,
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },
  mainCardImage: { alignItems: "center" },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  SmallText: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  label: { marginTop: 10, marginBottom: 5 },
  inputModern: { backgroundColor: "#f9fafc", borderRadius: 12, padding: 12 },
  primaryButton: {
    backgroundColor: "#98d6ff",
    padding: 15,
    borderRadius: 25,
    marginTop: 20,
    alignItems: "center",
  },
  primaryButtonText: { color: "#fff", fontWeight: "bold" },
  secondaryButton: { marginTop: 15, alignItems: "center" },
  secondaryButtonText: { color: "#2f3e9e", fontWeight: "bold" },
  container: { flex: 1, backgroundColor: "#f2f3f7" },
  top: {
    backgroundColor: "#2c5ac8",
    paddingTop: 70,
    paddingBottom: 40,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  cardCurrency: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    elevation: 3,
  },
  row: { flexDirection: "row", alignItems: "center" },
  flag: { width: 55, height: 40, marginRight: 15, borderRadius: 5 },
  code: { fontWeight: "bold", fontSize: 16 },
  desc: { fontSize: 13, color: "#777", marginTop: 4 },
  searchContainer: {
    paddingHorizontal: 15,
    marginTop: -20,
    marginBottom: 10,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    elevation: 5,
  },
  bottomMenu: {
    height: 60,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  menuText: { color: "#888", fontWeight: "bold", fontSize: 12 },
  menuTextActive: { color: "#2c5ac8", fontWeight: "bold", fontSize: 12 },
});
