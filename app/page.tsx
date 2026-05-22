"use client";
import { useEffect, useState } from "react";
export default function Page() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    fetch("/api/items")
        .then(res => res.json())
        .then(setItems);
  }, []);
  return (
      <div>
        <h1>Movies from 1920</h1>
        {items.map((item: any) => (
            <div key={item._id}>{item.title} {item.year}</div>
        ))}
      </div>
  );
}