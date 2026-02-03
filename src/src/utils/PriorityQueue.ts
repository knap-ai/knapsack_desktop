interface PriorityQueueItem<T> {
  priority: number;
  value: T;
}

export class PriorityQueue<T> {
  private items: PriorityQueueItem<T>[] = [];

  enqueue(item: T, priority: number): void {
    const queueItem = { priority, value: item };
    let added = false;

    for (let i = 0; i < this.items.length; i++) {
      if (priority > this.items[i].priority) {
        this.items.splice(i, 0, queueItem);
        added = true;
        break;
      }
    }

    if (!added) {
      this.items.push(queueItem);
    }
  }

  dequeue(): T | undefined {
    const item = this.items.shift();
    return item?.value;
  }

  peek(): T | undefined {
    return this.items[0]?.value;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }

  clear(): void {
    this.items = [];
  }

  toArray(): T[] {
    return this.items.map(item => item.value);
  }
}
