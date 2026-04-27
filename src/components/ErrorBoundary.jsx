import { Component } from 'react';

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '60vh',
                    padding: 40,
                    textAlign: 'center',
                    fontFamily: "'Inter', sans-serif",
                }}>
                    <h2 style={{ marginBottom: 8, color: '#111827' }}>Something went wrong</h2>
                    <p style={{ color: '#6b7280', marginBottom: 20, maxWidth: 400 }}>
                        An unexpected error occurred. Please try refreshing the page.
                    </p>
                    <button
                        onClick={this.handleReset}
                        style={{
                            padding: '10px 24px',
                            borderRadius: 12,
                            border: 'none',
                            background: '#2563eb',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '1rem',
                            cursor: 'pointer',
                        }}
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
