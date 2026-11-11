import Ionicons from '@expo/vector-icons/Ionicons';
import { AISLES, AISLE_LABELS, formatShoppingAmount, formatShoppingListText, formatWeekRange } from '@olympe/core';
import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { Body, Button, Card, Row, Screen, SectionTitle } from '../components/ui';
import { useData } from '../data/store';
import { useTheme } from '../theme';

export default function Courses() {
  const { start } = useLocalSearchParams<{ start: string }>();
  const { repos, version, refresh } = useData();
  const t = useTheme();

  const { stored, checked } = useMemo(
    () => ({ stored: repos.plans.get(start), checked: repos.shopping.checked(start) }),
    [repos, start, version],
  );

  if (!stored) return <Screen><Body>Pas de planning pour cette semaine.</Body></Screen>;
  const items = stored.plan.shoppingList;
  const done = items.filter((i) => checked.has(i.ingredientId)).length;

  const toggle = (id: string) => {
    repos.shopping.setChecked(start, id, !checked.has(id));
    refresh();
  };
  const share = () => {
    Share.share({ message: formatShoppingListText(items, `Courses de la semaine ${formatWeekRange(start)}`) }).catch(() => undefined);
  };

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between' }}>
        <Body muted>Semaine {formatWeekRange(start)}</Body>
        <Body bold>{done} / {items.length}</Body>
      </Row>
      <Button label="Envoyer à ma compagne" icon="share-outline" onPress={share} />

      {AISLES.map((aisle) => {
        const inAisle = items.filter((i) => i.aisle === aisle);
        if (inAisle.length === 0) return null;
        return (
          <View key={aisle} style={{ gap: 8 }}>
            <SectionTitle>{AISLE_LABELS[aisle]}</SectionTitle>
            <Card style={{ paddingVertical: 4 }}>
              {inAisle.map((item) => {
                const isChecked = checked.has(item.ingredientId);
                return (
                  <Pressable
                    key={item.ingredientId}
                    onPress={() => toggle(item.ingredientId)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isChecked }}
                    style={({ pressed }) => [styles.item, pressed && { opacity: 0.6 }]}
                  >
                    <Ionicons name={isChecked ? 'checkbox' : 'square-outline'} size={24} color={isChecked ? t.accent : t.muted} />
                    <View style={{ flex: 1, gap: 2 }}>
                      <Row style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
                        <Text style={[styles.name, { color: isChecked ? t.muted : t.text }, isChecked && styles.struck]}>{item.name}</Text>
                        <Text style={[styles.amount, { color: isChecked ? t.muted : t.text }]}>{formatShoppingAmount(item)}</Text>
                      </Row>
                      {!isChecked && (
                        <Text style={{ color: t.muted, fontSize: 12 }}>
                          {item.usedBy.length} repas{item.leftover > 0 && item.packs.length > 0 ? ` · reste ${Math.round(item.leftover)} ${item.unit === 'piece' ? '' : item.unit}` : ''}
                        </Text>
                      )}
                      {!isChecked && item.notes.map((n) => <Text key={n} style={{ color: t.warn, fontSize: 13 }}>{n}</Text>)}
                    </View>
                  </Pressable>
                );
              })}
            </Card>
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 10, minHeight: 48 },
  name: { fontSize: 15, fontWeight: '600', flex: 1 },
  amount: { fontSize: 15, fontVariant: ['tabular-nums'] },
  struck: { textDecorationLine: 'line-through' },
});
