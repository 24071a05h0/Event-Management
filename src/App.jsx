import React, { useMemo, useState } from 'react';

const STORAGE_KEY = 'btech-events';

const seedEvents = [
  {
    id: 1,
    title: 'Coding Contest',
    date: '2026-05-05',
    venue: 'CSE Lab 2',
    category: 'Competition',
    coordinator: 'CSE Association',
    done: false,
  },
  {
    id: 2,
    title: 'Technical Seminar',
    date: '2026-05-12',
    venue: 'Main Auditorium',
    category: 'Seminar',
    coordinator: 'Placement Cell',
    done: false,
  },
  {
    id: 3,
    title: 'Project Expo',
    date: '2026-04-30',
    venue: 'Innovation Hall',
    category: 'Expo',
    coordinator: 'Final Year Team',
    done: true,
  },
];

const emptyForm = {
  title: '',
  date: '',
  venue: '',
  category: 'Workshop',
  coordinator: '',
};

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

function loadEvents() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : seedEvents;
  } catch {
    return seedEvents;
  }
}

function saveEvents(events) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

function formatDate(date) {
  return dateFormatter.format(new Date(`${date}T00:00:00`));
}

export default function App() {
  const [events, setEvents] = useState(loadEvents);
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const updateEvents = (nextEvents) => {
    setEvents(nextEvents);
    saveEvents(nextEvents);
  };

  const stats = useMemo(() => {
    const completed = events.filter((event) => event.done).length;
    const upcoming = events.length - completed;
    const nextEvent = events
      .filter((event) => !event.done)
      .sort((a, b) => a.date.localeCompare(b.date))[0];

    return {
      total: events.length,
      completed,
      upcoming,
      next: nextEvent ? formatDate(nextEvent.date) : 'No pending events',
    };
  }, [events]);

  const visibleEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return events
      .filter((event) => {
        if (filter === 'pending') return !event.done;
        if (filter === 'completed') return event.done;
        return true;
      })
      .filter((event) => {
        if (!normalizedQuery) return true;
        return [event.title, event.venue, event.category, event.coordinator]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [events, filter, query]);

  const addEvent = (event) => {
    event.preventDefault();

    const cleanedForm = {
      title: form.title.trim(),
      date: form.date,
      venue: form.venue.trim(),
      category: form.category,
      coordinator: form.coordinator.trim(),
    };

    if (!cleanedForm.title || !cleanedForm.date || !cleanedForm.venue) return;

    updateEvents([
      {
        id: crypto.randomUUID(),
        ...cleanedForm,
        coordinator: cleanedForm.coordinator || 'Not assigned',
        done: false,
      },
      ...events,
    ]);
    setForm(emptyForm);
  };

  const toggleDone = (id) => {
    updateEvents(
      events.map((event) =>
        event.id === id ? { ...event, done: !event.done } : event
      )
    );
  };

  const removeEvent = (id) => {
    updateEvents(events.filter((event) => event.id !== id));
  };

  const clearCompleted = () => {
    updateEvents(events.filter((event) => !event.done));
  };

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Department event desk</p>
          <h1>BTech Event Management</h1>
          <p className="intro">
            Plan, track, and close college events from one fast dashboard.
          </p>
        </div>
        <button
          className="secondary-action"
          type="button"
          onClick={clearCompleted}
          disabled={!stats.completed}
        >
          Clear completed
        </button>
      </section>

      <section className="stats-grid" aria-label="Event summary">
        <article>
          <span>Total</span>
          <strong>{stats.total}</strong>
        </article>
        <article>
          <span>Upcoming</span>
          <strong>{stats.upcoming}</strong>
        </article>
        <article>
          <span>Completed</span>
          <strong>{stats.completed}</strong>
        </article>
        <article>
          <span>Next date</span>
          <strong>{stats.next}</strong>
        </article>
      </section>

      <section className="workspace">
        <form className="event-form" onSubmit={addEvent}>
          <div className="form-header">
            <h2>Add event</h2>
            <p>Required fields are title, date, and venue.</p>
          </div>

          <label>
            <span>Event title</span>
            <input
              type="text"
              placeholder="Example: AI Workshop"
              value={form.title}
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
              required
            />
          </label>

          <div className="form-row">
            <label>
              <span>Date</span>
              <input
                type="date"
                value={form.date}
                onChange={(event) =>
                  setForm({ ...form, date: event.target.value })
                }
                required
              />
            </label>

            <label>
              <span>Category</span>
              <select
                value={form.category}
                onChange={(event) =>
                  setForm({ ...form, category: event.target.value })
                }
              >
                <option>Workshop</option>
                <option>Competition</option>
                <option>Seminar</option>
                <option>Expo</option>
                <option>Cultural</option>
              </select>
            </label>
          </div>

          <label>
            <span>Venue</span>
            <input
              type="text"
              placeholder="Example: Seminar Hall"
              value={form.venue}
              onChange={(event) =>
                setForm({ ...form, venue: event.target.value })
              }
              required
            />
          </label>

          <label>
            <span>Coordinator</span>
            <input
              type="text"
              placeholder="Faculty, club, or team"
              value={form.coordinator}
              onChange={(event) =>
                setForm({ ...form, coordinator: event.target.value })
              }
            />
          </label>

          <button className="primary-action" type="submit">
            Add event
          </button>
        </form>

        <section className="event-panel">
          <div className="toolbar">
            <label className="search">
              <span>Search events</span>
              <input
                type="search"
                placeholder="Search by title, venue, category..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>

            <div className="filters" aria-label="Filter events">
              {['all', 'pending', 'completed'].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={filter === option ? 'active' : ''}
                  onClick={() => setFilter(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {visibleEvents.length ? (
            <ul className="event-list">
              {visibleEvents.map((event) => (
                <li key={event.id} className={event.done ? 'done' : ''}>
                  <div className="event-date">
                    <strong>{formatDate(event.date).slice(0, 2)}</strong>
                    <span>{formatDate(event.date).slice(3, 6)}</span>
                  </div>

                  <div className="event-info">
                    <div className="event-title-row">
                      <h3>{event.title}</h3>
                      <span>{event.category}</span>
                    </div>
                    <p>{event.venue}</p>
                    <small>{event.coordinator}</small>
                  </div>

                  <div className="actions">
                    <button type="button" onClick={() => toggleDone(event.id)}>
                      {event.done ? 'Reopen' : 'Done'}
                    </button>
                    <button type="button" onClick={() => removeEvent(event.id)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <h3>No events found</h3>
              <p>Adjust the search or add a new event to continue planning.</p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
