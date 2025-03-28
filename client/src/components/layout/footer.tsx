import { useLocation } from 'wouter';

export function Footer() {
  const [, setLocation] = useLocation();

  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">AppointEase</h3>
            <p className="text-gray-300">Making appointment booking simple and efficient for everyone.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Categories</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  className="text-gray-300 hover:text-white cursor-pointer"
                  onClick={() => setLocation('/?category=Healthcare')}
                >
                  Healthcare
                </a>
              </li>
              <li>
                <a 
                  className="text-gray-300 hover:text-white cursor-pointer"
                  onClick={() => setLocation('/?category=Sports')}
                >
                  Sports
                </a>
              </li>
              <li>
                <a 
                  className="text-gray-300 hover:text-white cursor-pointer"
                  onClick={() => setLocation('/?category=Personal_Care')}
                >
                  Personal Care
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a className="text-gray-300 hover:text-white cursor-pointer">Help Center</a>
              </li>
              <li>
                <a 
                  className="text-gray-300 hover:text-white cursor-pointer"
                  onClick={() => setLocation('/auth')}
                >
                  Provider Sign Up
                </a>
              </li>
              <li>
                <a className="text-gray-300 hover:text-white cursor-pointer">Customer Support</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="text-gray-300">support@appointease.com</li>
              <li className="text-gray-300">1-800-APPOINT</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} AppointEase. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
