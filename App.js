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
} from "react-native";

import "react-native-gesture-handler";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { enableScreens } from "react-native-screens";

import { initializeApp } from "firebase/app";

import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";

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

function HomeScreen({ navigation }) {
  const [email, setEmail] = React.useState("");
  const [senha, setSenha] = React.useState("");

  const fazerLogin = async () => {
    const emailTratado = email.trim();

    if (!emailTratado || !senha) {
      Alert.alert("Erro", "Preencha email e senha");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, emailTratado, senha);

      if (Platform.OS === "web") {
        window.alert("Sucesso: Login realizado com sucesso!");
        navigation.replace("Pais");
      } else {
        Alert.alert("Sucesso", "Login realizado com sucesso!", [
          { text: "OK", onPress: () => navigation.replace("Pais") },
        ]);
      }
    } catch (error) {
      if (Platform.OS === "web") {
        window.alert("Email ou senha incorreta!");
      } else {
        Alert.alert("Email ou senha incorreta!");
      }
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
            style={{ width: 200, height: 200 }}
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

        <TouchableOpacity style={styles.primaryButton} onPress={fazerLogin}>
          <Text style={styles.primaryButtonText}>Login</Text>
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

      if (Platform.OS === "web") {
        window.alert("Sucesso: Cadastro realizado!");
        navigation.replace("Home");
      } else {
        Alert.alert("Sucesso", "Cadastro realizado!", [
          { text: "OK", onPress: () => navigation.replace("Home") },
        ]);
      }
    } catch (error) {
      let msgErro = error.message;
      if (error.code === "auth/invalid-email")
        msgErro =
          "Formato de e-mail inválido. Verifique se há espaços indesejados.";
      if (error.code === "auth/email-already-in-use")
        msgErro = "Esse e-mail já está cadastrado!";
      if (error.code === "auth/weak-password")
        msgErro = "A senha precisa ter pelo menos 6 caracteres.";

      if (Platform.OS === "web") {
        window.alert("Erro no Cadastro: " + msgErro);
      } else {
        Alert.alert("Erro no Cadastro", msgErro);
      }
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
            style={{ width: 200, height: 200 }}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.sectionTitle}>Novo usuário</Text>

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
          placeholder="Digite uma senha forte"
        />

        <TouchableOpacity style={styles.primaryButton} onPress={cadastrar}>
          <Text style={styles.primaryButtonText}>Cadastrar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.secondaryButtonText}>Já tenho conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function PaisScreen() {
  const [paises, setPaises] = React.useState([]);
  const [busca, setBusca] = React.useState("");

  const buscarNaApi = async (textoDaBusca) => {
    try {
      let url = "https://restcountries.com/v3.1/all?fields=name,capital,flags";

      if (textoDaBusca.trim() !== "") {
        url = `https://restcountries.com/v3.1/name/${textoDaBusca.trim()}?fields=name,capital,flags`;
      }

      const res = await fetch(url);

      if (res.status === 404) {
        setPaises([]);
        return;
      }

      const data = await res.json();
      setPaises(data);
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    buscarNaApi("");
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 90 }}
      >
        <View style={styles.top}>
          <Text style={styles.title}>Países</Text>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Digite e aperte enter no teclado..."
            placeholderTextColor="#888"
            value={busca}
            onChangeText={setBusca}
            onSubmitEditing={() => buscarNaApi(busca)}
            returnKeyType="search"
          />
        </View>

        <View style={{ padding: 15 }}>
          {paises.map((item, i) => {
            const nome = item.name?.common || "Sem nome";
            const capital = item.capital?.[0] || "Sem capital";

            return (
              <View key={i} style={styles.cardCurrency}>
                <View style={styles.row}>
                  <Image
                    source={{ uri: item.flags?.png }}
                    style={styles.flag}
                  />
                  <View>
                    <Text style={styles.code}>{nome}</Text>
                    <Text style={styles.desc}>Capital: {capital}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Conheça o Mundo 🌎</Text>
      </View>
    </View>
  );
}

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Cadastro" component={CadastroScreen} />
        <Stack.Screen name="Pais" component={PaisScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  containerApp: {
    flex: 1,
    backgroundColor: "#e3f3fe",
  },
  header: {
    backgroundColor: "#e3f3fe",
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "#ffd166",
    fontSize: 16,
    marginTop: 5,
  },
  mainCard: {
    backgroundColor: "#fff",
    margin: 20,
    marginTop: -30,
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },
  mainCardImage: {
    alignItems: "center",
  },
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
  label: {
    marginTop: 10,
    marginBottom: 5,
  },
  inputModern: {
    backgroundColor: "#f9fafc",
    borderRadius: 12,
    padding: 12,
  },
  primaryButton: {
    backgroundColor: "#98d6ff",
    padding: 15,
    borderRadius: 25,
    marginTop: 20,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  secondaryButton: {
    marginTop: 15,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#2f3e9e",
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    backgroundColor: "#f2f3f7",
  },
  top: {
    backgroundColor: "#2c5ac8",
    paddingTop: 70,
    paddingBottom: 40,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  cardCurrency: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  flag: {
    width: 55,
    height: 40,
    marginRight: 15,
    borderRadius: 5,
  },
  code: {
    fontWeight: "bold",
    fontSize: 16,
  },
  desc: {
    fontSize: 13,
    color: "#777",
    marginTop: 4,
  },
  footer: {
    height: 60,
    backgroundColor: "#2c5ac8",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: "#fff",
    fontWeight: "bold",
  },
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
});
