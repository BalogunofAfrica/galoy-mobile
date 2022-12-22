import * as React from "react"
import { View } from "react-native"
import { Input, Text } from "@rneui/base"
import EStyleSheet from "react-native-extended-stylesheet"
import Icon from "react-native-vector-icons/Ionicons"
import { CloseCross } from "../../components/close-cross"
import { IconTransaction } from "../../components/icon-transactions"
import { LargeButton } from "../../components/large-button"
import { Screen } from "../../components/screen"
import { useMutation } from "@galoymoney/client"
import { palette } from "../../theme/palette"
import type { ContactStackParamList } from "../../navigation/stack-param-lists"
import { StackNavigationProp } from "@react-navigation/stack"
import { RouteProp } from "@react-navigation/native"
import type { ScreenType } from "../../types/jsx"
import { ContactTransactionsDataInjected } from "./contact-transactions"
import useMainQuery from "@app/hooks/use-main-query"
import { WalletType } from "@app/utils/enum"
import { useI18nContext } from "@app/i18n/i18n-react"

const styles = EStyleSheet.create({
  actionsContainer: { marginBottom: "15rem", backgroundColor: palette.lighterGrey },

  amount: {
    color: palette.white,
    fontSize: "36rem",
  },

  amountSecondary: {
    color: palette.white,
    fontSize: "16rem",
  },

  amountView: {
    alignItems: "center",
    paddingBottom: "6rem",
    backgroundColor: palette.coolGrey,
    paddingTop: 40,
  },

  contactBodyContainer: {
    flex: 1,
  },

  icon: { margin: 0 },

  inputContainer: {
    flexDirection: "row",
  },

  screen: {},

  inputStyle: { textAlign: "center", textDecorationLine: "underline" },

  screenTitle: { fontSize: 18, marginBottom: 12, marginTop: 18 },

  transactionsView: {
    flex: 1,
    marginHorizontal: "30rem",
  },
})

type ContactDetailProps = {
  route: RouteProp<ContactStackParamList, "contactDetail">
  navigation: StackNavigationProp<ContactStackParamList, "contactDetail">
}

export const ContactsDetailScreen: ScreenType = ({
  route,
  navigation,
}: ContactDetailProps) => {
  const { contact } = route.params
  const { refetch: refetchMain } = useMainQuery()
  return (
    <ContactsDetailScreenJSX
      navigation={navigation}
      contact={contact}
      refetchMain={refetchMain}
    />
  )
}

type ContactDetailScreenProps = {
  contact: Contact
  navigation: StackNavigationProp<ContactStackParamList, "contactDetail">
  refetchMain: () => void
}

export const ContactsDetailScreenJSX: ScreenType = ({
  contact,
  navigation,
  refetchMain,
}: ContactDetailScreenProps) => {
  const [contactName, setContactName] = React.useState(contact.alias)
  const { LL } = useI18nContext()
  const [userContactUpdateAlias] = useMutation.userContactUpdateAlias({
    onCompleted: () => refetchMain(),
  })

  const updateName = async () => {
    // TODO: need optimistic updates
    // FIXME this one doesn't work
    await userContactUpdateAlias({
      variables: { input: { username: contact.username, alias: contactName } },
    })
  }

  return (
    <Screen style={styles.screen} unsafe>
      <View style={styles.amountView}>
        <Icon
          name="ios-person-outline"
          size={86}
          color={palette.white}
          style={styles.icon}
        />
        <View style={styles.inputContainer}>
          <Input
            style={styles.amount}
            inputStyle={styles.inputStyle}
            inputContainerStyle={{ borderColor: palette.coolGrey }}
            onChangeText={setContactName}
            onSubmitEditing={updateName}
            onBlur={updateName}
            returnKeyType="done"
          >
            {contact.alias}
          </Input>
        </View>
        <Text style={styles.amountSecondary}>{`${LL.common.username()}: ${
          contact.username
        }`}</Text>
      </View>
      <View style={styles.contactBodyContainer}>
        <View style={styles.transactionsView}>
          <Text style={styles.screenTitle}>
            {LL.ContactDetailsScreen.title({
              username: contact.alias,
            })}
          </Text>
          <ContactTransactionsDataInjected
            navigation={navigation}
            contactUsername={contact.username}
          />
        </View>
        <View style={styles.actionsContainer}>
          <LargeButton
            title={LL.MoveMoneyScreen.send()}
            icon={
              <IconTransaction
                isReceive={false}
                walletType={WalletType.BTC}
                pending={false}
                onChain={false}
              />
            }
            onPress={() =>
              navigation.navigate("sendBitcoinDestination", {
                username: contact.username,
              })
            }
          />
        </View>
      </View>

      <CloseCross color={palette.white} onPress={navigation.goBack} />
    </Screen>
  )
}
