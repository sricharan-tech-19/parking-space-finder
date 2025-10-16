// app/components/ui/collapsible.tsx
import { PropsWithChildren, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

export default function Collapsible({ title = 'Section', children }: PropsWithChildren<{ title?: string }>) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ marginVertical: 8 }}>
      <Pressable onPress={() => setOpen(v => !v)}>
        <Text style={{ fontWeight: '600' }}>{title}</Text>
      </Pressable>
      {open ? <View style={{ marginTop: 8 }}>{children}</View> : null}
    </View>
  );
}
